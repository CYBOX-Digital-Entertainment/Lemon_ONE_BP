import { system, world } from "@minecraft/server";
import { readData, saveData } from "./db";
import { ActionFormData } from "@minecraft/server-ui";
import { EntityData } from "./class";
world.beforeEvents.playerInteractWithEntity.subscribe(e => {
    console.warn(`a`);
    const { itemStack, player, target } = e;
    if (target.typeId != "daewoo:tosca_gb")
        return;
    const rid = target.getComponent(`minecraft:rideable`);
    const data = readData(target.id);
    if (itemStack?.typeId.startsWith(`addon:`) || (!data.ride && itemStack?.getLore()[0].slice(14) != target.id)) {
        e.cancel = true;
        return;
    }
    if (itemStack?.typeId == "key:key" && itemStack?.getLore()[0].slice(14) == target.id) {
        e.cancel = true;
        console.warn(!data.ride);
        if (rid.getRiders()[0]?.id == player.id || rid.getRiders()[0]?.id == data.plid || data.ride) {
            openui2(player, data);
        }
        else {
            openui(player, data);
        }
    }
});
function openui(player, entity) {
    const data = new EntityData(entity);
    system.run(() => {
        if (data.tropen) {
            new ActionFormData().button(`운전자 탑승`).button(`트렁크 닫기`).show(player).then(t => {
                if (t.selection == 1) {
                    data.setTrOpen(false);
                    saveData(data.entid, data);
                    player.sendMessage(`트렁크가 닫혔습니다.`);
                    world.sendMessage(JSON.stringify(data));
                }
                else if (t.selection == 0) {
                    data.setPlid(player.id);
                    data.setRide(true);
                    world.sendMessage(JSON.stringify(data));
                    saveData(data.entid, data);
                    player.sendMessage(`이제 자동차에 탑승 할 수 있습니다`);
                }
            });
        }
        else if (data.tropen == false) {
            new ActionFormData().button(`운전자 탑승`).button(`트렁크 열기`).show(player).then(t => {
                if (t.selection == 1) {
                    data.setTrOpen(true);
                    saveData(data.entid, data);
                    player.sendMessage(`트렁크가 열렸습니다.`);
                    world.sendMessage(JSON.stringify(data));
                }
                else if (t.selection == 0) {
                    data.setPlid(player.id);
                    data.setRide(true);
                    world.sendMessage(JSON.stringify(data));
                    saveData(data.entid, data);
                    player.sendMessage(`이제 자동차에 탑승 할 수 있습니다`);
                }
            });
        }
    });
}
function openui2(player, entity) {
    system.run(() => {
        const data = new EntityData(entity);
        if (entity.tropen) {
            new ActionFormData().button(`트렁크 닫기`).show(player).then(t => {
                if (t.selection == 0) {
                    data.setTrOpen(false);
                    //saveData(entity.entid, entity2)
                    player.sendMessage(`트렁크가 닫혔습니다.`);
                    world.sendMessage(JSON.stringify(data));
                }
            });
        }
        else if (entity.tropen == false) {
            new ActionFormData().button(`트렁크 열기`).show(player).then(t => {
                if (t.selection == 0) {
                    data.setTrOpen(true);
                    saveData(entity.entid, data);
                    player.sendMessage(`트렁크가 열렸습니다.`);
                    world.sendMessage(JSON.stringify(data));
                }
            });
        }
    });
}
