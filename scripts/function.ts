import { EntityInventoryComponent, EntityRideableComponent, ItemStack, Player, system, world } from "@minecraft/server";
import { EntityData } from "./class"
import { saveData } from "./db"
import { ActionFormData } from "@minecraft/server-ui";

function getCar(player: Player) {
    const cars = player.dimension.getEntities({ type: "cybox:dw_tosca" });
    for (const car of cars) {
        let rideable = car.getComponent(EntityRideableComponent.componentId);
        if (rideable?.getRiders()[0].id === player.id) {
            return car;
        }
    }

    throw new Error("Failed to get car");
}

export function playAni(player: Player, eventName: string) {
    getCar(player).triggerEvent(eventName);
}

export function openui(player: Player, entityData: EntityData) {
    const data = new EntityData(entityData)
    const entity = data.entity()
    if (entity === undefined) {
        return
    }

    system.run(() => {
        if (data.tropen) {
            new ActionFormData()
                .button(`운전자 탑승`)
                .button(`트렁크 닫기`)
                .show(player)
                .then(result => {
                    if (result.selection == 1) {
                        data.setTrOpen(false)
                        saveData(data.entid, data)
                        player.sendMessage(`트렁크가 닫혔습니다.`)
                        entity.triggerEvent("bonnet_close");
                        world.sendMessage(JSON.stringify(data))
                    } else if (result.selection == 0) {
                        data.setPlid(player.id)
                        world.sendMessage(JSON.stringify(data))
                        saveData(data.entid, data)
                        world.getEntity(data.entid)?.runCommand(`ride @p[name=${player.name}] start_riding @s`);
                    }
                })
        } else if (!data.tropen) {
            new ActionFormData()
                .button(`운전자 탑승`)
                .button(`트렁크 열기`)
                .show(player)
                .then(result => {
                    if (result.selection == 1) {
                        data.setTrOpen(true)
                        saveData(data.entid, data)
                        player.sendMessage(`트렁크가 열렸습니다.`)
                        entity.triggerEvent("bonnet_open");
                        world.sendMessage(JSON.stringify(data))
                    } else if (result.selection == 0) {
                        data.setPlid(player.id)
                        world.sendMessage(JSON.stringify(data))
                        saveData(data.entid, data)
                        world.getEntity(data.entid)?.runCommand(`ride @p[name=${player.name}] start_riding @s`);
                    }
                })
        }
    })
}



export function openui2(player: Player, entity: EntityData) {
    system.run(() => {
        const data = new EntityData(entity)
        if (entity.tropen) {
            new ActionFormData().button(`트렁크 닫기`).show(player).then(t => {
                if (t.selection == 0) {
                    data.setTrOpen(false)
                    saveData(entity.entid, data)
                    player.sendMessage(`트렁크가 닫혔습니다.`)
                    world.sendMessage(JSON.stringify(data))
                }
            })
        } else if (!entity.tropen) {
            new ActionFormData().button(`트렁크 열기`).show(player).then(t => {
                if (t.selection == 0) {
                    data.setTrOpen(true)
                    saveData(entity.entid, data)
                    player.sendMessage(`트렁크가 열렸습니다.`)
                    world.sendMessage(JSON.stringify(data))
                }
            })
        }
    })
}



export function tpTr(data: EntityData) {
    const tr = world.getEntity(data.trid)
    const ent = world.getEntity(data.entid)
    let loc = ent?.location
    if (loc == undefined) return
    if (!data.tropen) {
        loc.y += 100
    }
    tr?.runCommandAsync(`tp ${loc?.x} ${loc?.y} ${loc?.z}`)
}


export function on_off(iv: EntityInventoryComponent, itemName: string, index: number) {
    iv?.container?.setItem(index, new ItemStack(itemName))
}
