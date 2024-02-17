import { Entity, EntityInventoryComponent, EntityMovementComponent, EntityRideableComponent, EntityType, ItemStack, Player, system, world } from "@minecraft/server";
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

function isEmptyContainer(entity: Entity): boolean {
    const inventory = entity.getComponent(EntityInventoryComponent.componentId)
    if (inventory == undefined) throw new Error("Failed to get inventory");
    if (inventory.container?.emptySlotsCount === inventory.container?.size) {
        return true
    }
    return false
}

export function hasKey(player: Player, car: Entity) {
    const inventory = player.getComponent(EntityInventoryComponent.componentId)
    if (!inventory?.inventorySize) return false;
    for (let i = 0; i < inventory?.inventorySize; i++) {
        const item = inventory.container?.getItem(i)
        if (item?.typeId === "key:dw_tosca_key" && item?.getLore()[0]?.slice(14) == car.id) { return true; }
    }
    return false;
}

export function playAni(player: Player, eventName: string) {
    getCar(player).triggerEvent(eventName);
}

export function openui(player: Player, entityData: EntityData) {
    const data = new EntityData(entityData)
    const entity = data.entity()
    const trunk = data.trunk()
    if (entity === undefined || trunk === undefined) {
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
                        world.sendMessage(JSON.stringify(data))
                        entity.triggerEvent(`bonnet_open`)
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
    const trunk = data.trunk()
    if (entity === undefined || trunk === undefined) {
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
                        entity.getComponent(EntityMovementComponent.componentId)?.setCurrentValue(0)
                        saveData(entity.id, data)
                        saveData("car:" + entity.id, data2)
                    }
                })
        } else if (!data.tropen) {
            new ActionFormData()
                .button(`차문 닫기`, 'textures/items/door_off')
                .show(player)
                .then(res => {
                    if (res.canceled) return;
                    if (res.selection == 0) {
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
                        entity.getComponent(EntityMovementComponent.componentId)?.setCurrentValue(0)
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
    let dir = ent?.getViewDirection()
    if (loc == undefined || dir == undefined) return
    if (!data.tropen) {
        loc.y += 100
    }
    tr?.runCommandAsync(`tp ${loc?.x - (dir?.x * 5)} ${loc?.y + 1} ${loc?.z - (dir?.z * 5)}`)
}


export function on_off(iv: EntityInventoryComponent, itemName: string, index: number) {
    iv?.container?.setItem(index, new ItemStack(itemName))
}

export function loop(entity: Entity) {
    const data = new EntityData(readData(entity.id) as EntityData)
    const cardata = readData("car:" + entity.id) as {
        headLight: boolean, // 헤드라이트
        left_signal: boolean, // 좌 신호등
        right_signal: boolean,// 우 신호등
        window: boolean, //창문
        speed: number,
        siren: boolean
    }
    if (cardata.headLight) {
        entity.runCommandAsync(`fill ~3 ~3 ~3 ~-3 ~-3 ~-3 air replace light_block`);
        entity.runCommandAsync(`setblock ~~~ light_block ["block_light_level"=15]`);
    }
    const trunk = data.trunk()
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
    if (trunk == undefined) return;
    if (isEmptyContainer(trunk)) {
        entity.triggerEvent(`freight_remove`)
    } else {
        entity.triggerEvent(`freight_add`)
    }
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
        data.enableFriend = false;
        data.setPlid("")
        entity.getComponent(EntityMovementComponent.componentId)?.setCurrentValue(0)
        saveData("car:" + entity.id, data2)
        saveData(entity.id, data)
    }


    const dimension = entity.dimension;
    const id = entity.id;
    const entityData = readData(entity.id) as EntityData
    const getSolid = (entity: Entity, pos: string) => dimension.getEntities({ type: "cybox:dw_tosca_solid", name: `${pos}:${String(entity.id)}` });

    if (getSolid(entity, 'front').length !== 1 || ((entityData.ride2 && !entityData.ride) || entityData.enableFriend)) {
        getSolid(entity, 'front').forEach(x => x.remove());
    }
    if (!(entityData.ride2 && !entityData.ride) && !entityData.enableFriend) {
        dimension.spawnEntity("cybox:dw_tosca_solid", entity.location).nameTag = `front:${id}`;
    }

    if (getSolid(entity, 'back').length !== 1 || ((entityData.ride2 && !entityData.ride) || entityData.enableFriend)) {
        getSolid(entity, 'back').forEach(x => x.remove());
    }
    if (!(entityData.ride2 && !entityData.ride) && !entityData.enableFriend) {
        dimension.spawnEntity("cybox:dw_tosca_solid", entity.location).nameTag = `back:${id}`;
    }

    getSolid(entity, 'front').forEach(x => {
        x.teleport({
            x: entity.location.x + entity.getViewDirection().x * -0.5,
            y: entity.location.y,
            z: entity.location.z + entity.getViewDirection().z * -0.5
        })
    })

    getSolid(entity, 'back').forEach(x => {
        x.teleport({
            x: entity.location.x + entity.getViewDirection().x * -4.7,
            y: entity.location.y,
            z: entity.location.z + entity.getViewDirection().z * -4.7
        })
    })
}

interface KIT_EVENT {
    [key: string]: any;
}
export const KIT_EVENT: KIT_EVENT = {
    'cybox:tosca_paint_ddg': 'color_tosca_ddg',
    'cybox:tosca_paint_gb': 'color_tosca_gb',
    'cybox:tosca_paint_gw': 'color_tosca_gw',
    'cybox:tosca_paint_kr': 'color_tosca_kr',
    'cybox:tosca_paint_og': 'color_tosca_og',
    'cybox:tosca_paint_pb': 'color_tosca_pb',
    'cybox:tosca_paint_ps': 'color_tosca_ps',
    'cybox:tosca_paint_sdg': 'color_tosca_sdg',
    'cybox:tosca_paint_wp': 'color_tosca_wp',
    'cybox:tosca_police_kit': 'kit_tosca_police'
}