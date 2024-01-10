import { Component, EntityInventoryComponent, EntityRideableComponent, ItemStack, Player, system, world } from "@minecraft/server";
import { EntityData } from "./class"
import { saveData } from "./db"
import { ActionFormData } from "@minecraft/server-ui";

export function playAni(player: Player, eventName: string) {
    player.dimension.getEntities({
        type: "daewoo:tosca_gb",
        tags: [`id:${player.id}`] // 변경 된 코드에 따라 수정 예정
    }).forEach(f => {
        const rid = f.getComponent(`minecraft:rideable`) as EntityRideableComponent
        if (rid.getRiders()[0].id == player.id) {
            f.triggerEvent(eventName)
        }
    })
}

export function openui(player: Player, entity: EntityData) {
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
                    player.runCommandAsync(``)// 탑승 명령어 추가 예정
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
                    player.runCommandAsync(``)// 탑승 명령어 추가 예정
                    saveData(data.entid, data)
                    player.sendMessage(`이제 자동차에 탑승 할 수 있습니다`)
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
    iv.container.setItem(index, new ItemStack(itemName))
}