import { Entity, EntityInventoryComponent, EntityRideableComponent, EntityType, ItemStack, Player, system, world } from "@minecraft/server";
import { EntityData } from "./class"
import { readData, saveData } from "./db"
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
                .button(`차문 열기`, 'textures/items/door_on')
                .button(`트렁크 닫기`, 'textures/items/bonnet_close')
                .show(player)
                .then(result => {
                    if (result.selection == 1) {
                        data.setTrOpen(false)
                        saveData(data.entid, data)
                        player.sendMessage(`트렁크가 닫혔습니다.`)
                        entity.triggerEvent("bonnet_close");
                        world.sendMessage(JSON.stringify(data))
                    } else if (result.selection == 0) {
                        data.setTrOpen(false)
                        saveData(data.entid, data)
                        data.setPlid(player.id)
                        data.ride2 = true
                        world.sendMessage(JSON.stringify(data))
                        saveData(data.entid, data)
                        entity.triggerEvent("right_front_door_open")
                    }
                })
        } else if (!data.tropen) {
            new ActionFormData()
                .button(`차문 열기`, 'textures/items/door_on')
                .button(`트렁크 열기`, 'textures/items/bonnet_open')
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
                        data.ride2 = true
                        world.sendMessage(JSON.stringify(data))
                        saveData(data.entid, data)
                        entity.triggerEvent("right_front_door_open")
                    }
                })
        }
    })
}


export function openui2(player: Player, entityData: EntityData) {
    const data = new EntityData(entityData)
    const entity = data.entity()
    if (entity === undefined) {
        return
    }

    system.run(() => {
        if (data.tropen) {
            new ActionFormData()
                .button(`차문 닫기`, 'textures/items/door_off')
                .button(`트렁크 닫기`, 'textures/items/bonnet_close')
                .show(player)
                .then(res => {
                    if (res.canceled) return;
                    if (res.selection == 1) {
                        data.setTrOpen(false)
                        saveData(data.entid, data)
                        player.sendMessage(`트렁크가 닫혔습니다.`)
                        entity.triggerEvent("bonnet_close");
                        world.sendMessage(JSON.stringify(data))
                    } else if (res.selection == 0) {
                        const data2 = {
                            headLight: false, // 헤드라이트
                            left_signal: false, // 좌 신호등
                            right_signal: false,// 우 신호등
                            window: true, //창문
                            speed: 30,
                            siren: false
                        }
                        data.option = false
                        data.ride2 = false
                        entity.triggerEvent(`back_mirror_close2`)
                        saveData(entity.id, data)
                        saveData("car:" + entity.id, data2)
                    }
                })
        } else if (!data.tropen) {
            new ActionFormData()
                .button(`차문 닫기`, 'textures/items/door_off')
                .button(`트렁크 열기`, 'textures/items/bonnet_open')
                .show(player)
                .then(res => {
                    if (res.canceled) return;
                    if (res.selection == 1) {
                        data.setTrOpen(true)
                        saveData(data.entid, data)
                        player.sendMessage(`트렁크가 열렸습니다.`)
                        entity.triggerEvent("bonnet_open");
                        world.sendMessage(JSON.stringify(data))
                    } else if (res.selection == 0) {
                        const data2 = {
                            headLight: false, // 헤드라이트
                            left_signal: false, // 좌 신호등
                            right_signal: false,// 우 신호등
                            window: true, //창문
                            speed: 30,
                            siren: false
                        }
                        data.option = false
                        data.ride2 = false
                        entity.triggerEvent(`right_front_door_close`)
                        saveData(entity.id, data)
                        saveData("car:" + entity.id, data2)
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

export function loop(entity: Entity) {
    const data = new EntityData(readData(entity.id) as EntityData)
    const data2 = {
        headLight: false, // 헤드라이트
        left_signal: false, // 좌 신호등
        right_signal: false,// 우 신호등
        window: true, //창문
        speed: 30,
        siren: false
    }
    tpTr(data)
    const component = entity.getComponent(EntityRideableComponent.componentId)

    if (component?.getRiders()[0]?.id !== data.plid && data.ride) {
        component?.ejectRiders()
        data.setRide(false)
        if (data.option) {
            entity.triggerEvent(`back_mirror_close`)
        } else {
            entity.triggerEvent(`right_front_door_close`)
        }
        data.ride2 = false
        data.option = false
        data.setPlid("")
        entity.triggerEvent(`car_stop`)
        saveData("car:" + entity.id, data2)
        saveData(entity.id, data)
    }
}