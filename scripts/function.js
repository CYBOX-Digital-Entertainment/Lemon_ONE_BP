import { EntityRideableComponent, ItemStack, system, world } from "@minecraft/server";
import { EntityData } from "./class";
import { readData, saveData } from "./db";
import { ActionFormData } from "@minecraft/server-ui";
function getCar(player) {
    const cars = player.dimension.getEntities({ type: "cybox:dw_tosca" });
    for (const car of cars) {
        let rideable = car.getComponent(EntityRideableComponent.componentId);
        if (rideable?.getRiders()[0].id === player.id) {
            return car;
        }
    }
    throw new Error("Failed to get car");
}
export function playAni(player, eventName) {
    getCar(player).triggerEvent(eventName);
}
export function openui(player, entityData) {
    const data = new EntityData(entityData);
    const entity = data.entity();
    if (entity === undefined) {
        return;
    }
    system.run(() => {
        if (data.tropen) {
            new ActionFormData()
                .button(`운전자 탑승`)
                .button(`트렁크 닫기`)
                .show(player)
                .then(result => {
                if (result.selection == 1) {
                    data.setTrOpen(false);
                    saveData(data.entid, data);
                    player.sendMessage(`트렁크가 닫혔습니다.`);
                    entity.triggerEvent("bonnet_close");
                    world.sendMessage(JSON.stringify(data));
                }
                else if (result.selection == 0) {
                    data.setPlid(player.id);
                    data.ride2 = true;
                    world.sendMessage(JSON.stringify(data));
                    saveData(data.entid, data);
                    entity.triggerEvent("right_front_door_open");
                }
            });
        }
        else if (!data.tropen) {
            new ActionFormData()
                .button(`운전자 탑승`)
                .button(`트렁크 열기`)
                .show(player)
                .then(result => {
                if (result.selection == 1) {
                    data.setTrOpen(true);
                    saveData(data.entid, data);
                    player.sendMessage(`트렁크가 열렸습니다.`);
                    entity.triggerEvent("bonnet_open");
                    world.sendMessage(JSON.stringify(data));
                }
                else if (result.selection == 0) {
                    data.setPlid(player.id);
                    data.ride2 = true;
                    world.sendMessage(JSON.stringify(data));
                    saveData(data.entid, data);
                    entity.triggerEvent("right_front_door_open");
                }
            });
        }
    });
}
export function tpTr(data) {
    const tr = world.getEntity(data.trid);
    const ent = world.getEntity(data.entid);
    let loc = ent?.location;
    if (loc == undefined)
        return;
    if (!data.tropen) {
        loc.y += 100;
    }
    tr?.runCommandAsync(`tp ${loc?.x} ${loc?.y} ${loc?.z}`);
}
export function on_off(iv, itemName, index) {
    iv?.container?.setItem(index, new ItemStack(itemName));
}
export function loop(entity) {
    const data = new EntityData(readData(entity.id));
    tpTr(data);
    const component = entity.getComponent(EntityRideableComponent.componentId);
    if (component?.getRiders()[0]?.id !== data.plid && data.ride) {
        component?.ejectRiders();
        data.setRide(false);
        data.ride2 = false;
        data.option = false;
        data.setPlid("");
        saveData(entity.id, data);
    }
}
