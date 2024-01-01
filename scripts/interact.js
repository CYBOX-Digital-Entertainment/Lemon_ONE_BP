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

const arr = [];

// 20틱 간격으로 실행되는 반복 작업
system.runInterval(() => {
    // 모든 플레이어에 대해 반복
    for (const player of world.getPlayers()) {
        // 플레이어의 손에 들고 있는 아이템 슬롯(Mainhand)을 가져옴
        const itemStack = player.getComponent("equippable").getEquipment("Mainhand");

        // 아이템 슬롯이 존재하고, 로어(lore)가 존재할 경우 실행
        if (itemStack && itemStack.getLore()[0]) {
            // 로어에서 타겟 엔티티의 ID를 추출
            const targetId = itemStack.getLore()[0].slice(14);

            // 추출한 타겟 ID에 해당하는 엔티티가 존재할 경우 실행
            if (world.getEntity(targetId)) {
                const target = world.getEntity(targetId);

                if (target.typeId !== "daewoo:tosca_gb") return;

                // 플레이어와 타겟 간의 거리를 계산
                const distance = getradius(player.location, target.location);
                const rid = target.getComponent(`minecraft:rideable`);

                // 거리가 5 이하인 경우 실행
                if (distance <= 5) {
                     if (arr.includes(player.name) == true) return
                    // 타겟의 `minecraft:rideable` 컴포넌트와 데이터를 가져옴
                    const data = readData(target.id);

                    // 키 타입이 "key:key"이고, 로어의 ID와 타겟의 ID가 일치하는 경우 실행
                    if (itemStack.typeId == "key:key") {
                        arr.push(player.name)
                        // 타겟을 타고 있는지 또는 타겟의 플레이어 ID와 데이터의 플레이어 ID가 일치하거나 데이터의 ride가 true인 경우
                        if (rid.getRiders()[0]?.id == player.id || rid.getRiders()[0]?.id == data.plid || data.ride) {
                            // UI를 열고 데이터 전달
                            openui2(player, data);
                        } else {
                            // UI를 열고 데이터 전달
                            openui(player, data);
                        }
                    }
                }
                else if (distance > 5) {
                    console.warn(arr)
                    if (arr.includes(player.name)) {
                        const index = arr.findIndex(element => element === player.name);

                        if (index !== -1) {
                            arr.splice(index, 1);
                        }
                    }
                }
            }
        }
    }
}, 10);


    function getradius(location1 , location2) {
        const X = Math.round(location2.x) - Math.round(location1.x);
        const Y = Math.round(location2.y) - Math.round(location1.y);
        const Z = Math.round(location2.z) - Math.round(location1.z);
    
        const result = Math.sqrt(X ** 2 + Y ** 2 + Z ** 2);
        return result;
    }

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
