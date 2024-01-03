import { EntityEquippableComponent, EntityRideableComponent, EquipmentSlot, Player, system, world } from "@minecraft/server";
import { readData, saveData } from "./db"
import { ActionFormData } from "@minecraft/server-ui";
import { EntityData } from "./class"

world.beforeEvents.playerInteractWithEntity.subscribe(e => {
    console.warn(`a`)
    const { itemStack, player, target } = e
    if (target.typeId != "daewoo:tosca_gb") return;
    const rid = target.getComponent(`minecraft:rideable`) as EntityRideableComponent
    const data = readData(target.id) as EntityData
    if (itemStack?.typeId.startsWith(`addon:`) || (!data.ride && itemStack?.getLore()[0].slice(14) != target.id)) {
        e.cancel = true
        return

    }
    if (itemStack?.typeId == "key:key" && itemStack?.getLore()[0].slice(14) == target.id) {
        e.cancel = true
        console.warn(!data.ride)
        if (rid.getRiders()[0]?.id == player.id || rid.getRiders()[0]?.id == data.plid || data.ride) {
            openui2(player, data)
        } else {
            openui(player, data)
        }
    }
})

const arr : string[] = [];

// 20틱 간격으로 실행되는 반복 작업
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        for (const target of player.dimension.getEntities({ "type": "daewoo:tosca_gb" })) {
            const radius = getradius(player.location, target.location);

            if (radius > 5) {
                console.warn(radius);

                if (arr.includes(player.name)) {
                    const index = arr.findIndex(element => element === player.name);

                    if (index !== -1) {
                        arr.splice(index, 1);
                    }
                }
            } else if (radius <= 5) {
                const eq = player.getComponent(EntityEquippableComponent.componentId) as EntityEquippableComponent;
                const mainhandEquipment = eq.getEquipment(EquipmentSlot.Mainhand)
                if (!mainhandEquipment || mainhandEquipment.getLore()[0] === undefined) {
                    continue;
                }

                const rid = target.getComponent("minecraft:rideable") as EntityRideableComponent;
                const data = readData(target.id) as EntityData;
                if (rid == undefined) return;
                if (mainhandEquipment.typeId.startsWith("addon:") || (!data.ride && mainhandEquipment.getLore()[0].slice(14) !== target.id)) {
                    continue;
                }

                if (mainhandEquipment.typeId === "key:key" && mainhandEquipment.getLore()[0].slice(14) === target.id && !arr.includes(player.name)) {
                    const isPlayerRiding = rid.getRiders()[0]?.id === player.id || rid.getRiders()[0]?.id === data.plid || data.ride;

                    arr.push(player.name);

                    if (isPlayerRiding) {
                        openui2(player, data);
                    } else {
                        openui(player, data);
                    }
                }
            }
        }
    }
}, 20);


function getradius(location1 , location2) {
    const X = Math.round(location2.x) - Math.round(location1.x);
    const Y = Math.round(location2.y) - Math.round(location1.y);
    const Z = Math.round(location2.z) - Math.round(location1.z);

    const result = Math.sqrt(Math.round(X ** 2 + Y ** 2 + Z ** 2));
    return result;
}





function openui(player: Player, entity: EntityData) {
   const data = new EntityData(entity)
    system.run(() => {
        if (data.tropen) {
            new ActionFormData().button(`운전자 탑승`).button(`트렁크 닫기`).show(player).then(t => {
                if (t.selection == 1) {
                    data.setTrOpen(false)
                    saveData(data.entid, data)
                    player.sendMessage(`트렁크가 닫혔습니다.`)
                    world.sendMessage(JSON.stringify(data))
                } else if (t.selection == 0) {
                    data.setPlid(player.id)
                    data.setRide(true)
                    world.sendMessage(JSON.stringify(data))
                    saveData(data.entid, data)
                    player.sendMessage(`이제 자동차에 탑승 할 수 있습니다`)
                }
            })
        } else if (data.tropen == false) {
            new ActionFormData().button(`운전자 탑승`).button(`트렁크 열기`).show(player).then(t => {
                if (t.selection == 1) {
                    data.setTrOpen(true)
                    saveData(data.entid, data)
                    player.sendMessage(`트렁크가 열렸습니다.`)
                    world.sendMessage(JSON.stringify(data))
                } else if (t.selection == 0) {
                    data.setPlid(player.id)
                    data.setRide(true)
                    world.sendMessage(JSON.stringify(data))
                    saveData(data.entid, data)
                    player.sendMessage(`이제 자동차에 탑승 할 수 있습니다`)
                }
            })
        }
    })
}



function openui2(player: Player, entity: EntityData) {
    system.run(() => {
        const data = new EntityData(entity)
        if (entity.tropen) {
            new ActionFormData().button(`트렁크 닫기`).show(player).then(t => {
                if (t.selection == 0) {
                    data.setTrOpen(false)
                    //saveData(entity.entid, entity2)
                    player.sendMessage(`트렁크가 닫혔습니다.`)
                    world.sendMessage(JSON.stringify(data))
                }
            })
        } else if (entity.tropen == false) {
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
