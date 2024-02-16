import { EntityMovementComponent, system, world } from "@minecraft/server";
import { readData, saveData } from "./db";
import { KIT_EVENT, hasKey, openui, openui2 } from "./function";
import { ActionFormData } from "@minecraft/server-ui";
world.beforeEvents.playerInteractWithEntity.subscribe(e => {
    const { itemStack, player, target } = e;
    if (target.typeId != "cybox:dw_tosca" || itemStack?.typeId === "cybox:dw_tosca_spawn_egg" || itemStack?.typeId.startsWith(`cybox:`)) {
        return;
    }
    const rid = target.getComponent(`minecraft:rideable`);
    const entityData = readData(target.id);
    if (itemStack?.typeId != "key:dw_tosca_key" && !entityData.ride2 && player.id !== entityData.plid) {
        if (rid.getRiders().length && entityData.enableFriend) {
            return;
        }
        e.cancel = true;
        console.warn(`cancel`);
        return;
    }
    else if (itemStack?.typeId != "key:dw_tosca_key" && (!entityData.ride && entityData.ride2 && player.id === entityData.plid)) {
        entityData.ride = true;
        entityData.ride2 = false;
        system.run(() => {
            target.triggerEvent("right_front_door_close");
            player.playAnimation('animation.tosca.dummy');
            target.getComponent(EntityMovementComponent.componentId)?.setCurrentValue(0);
        });
        saveData(target.id, entityData);
        return;
    }
    if (itemStack?.typeId == "key:dw_tosca_key" && entityData.ride2 && !entityData.ride && entityData.plid === player.id) {
        e.cancel = true;
        openui2(player, entityData);
        return;
    }
    //if (itemStack?.typeId == "key:dw_tosca_key" && itemStack?.getLore()[0].slice(14) == target.id) {
    if (rid.getRiders()[0]?.id === player.id && rid.getRiders()[0]?.id === entityData.plid && entityData.ride) {
        e.cancel = true;
        if (entityData.option) {
            if (!world?.getDynamicProperty(`car:${target.id}`)) {
                world.setDynamicProperty(`car:${target.id}`, JSON.stringify({
                    headLight: false, // 헤드라이트
                    left_signal: false, // 좌 신호등
                    right_signal: false, // 우 신호등
                    window: true, //창문
                    speed: 30,
                    siren: false
                }));
            }
            const speed = [30, 70, 100, 150, 220];
            const data = JSON.parse(world.getDynamicProperty(`car:${target.id}`));
            system.run(() => {
                const isPolice = target.hasTag("police");
                const ui = new ActionFormData()
                    .title('차')
                    .button(`다른 플레이어 탑승 ${data.enableFriend ? '차단' : '허용'}`, `textures/items/door_${data.enableFriend ? 'open' : 'close'}`)
                    .button(`§r헤드라이트 끄기\n[ ${data.headLight ? '§coff§r' : '§aon§r'} ]`, `textures/items/headlight_${data.headLight ? 'off' : 'on'}`)
                    .button(`§r좌측 신호등\n[ ${data.left_signal ? '§coff§r' : '§aon§r'} ]`, `textures/items/left_signal_${data.left_signal ? 'off' : 'on'}`)
                    .button(`§r우측 신호등\n[ ${data.right_signal ? '§coff§r' : '§aon§r'} ]`, `textures/items/right_signal_${data.right_signal ? 'off' : 'on'}`)
                    .button(`§r창문\n[ ${data.window ? '§aopen§r' : '§cclose§r'} ]`, `textures/items/roll_${data.window ? 'down' : 'up'}`)
                    .button(`§r속도 증가\n[ ${data.speed}${speed.indexOf(data.speed) === 4 ? '' : ` -> §a${speed[speed.indexOf(data.speed) + 1]}§r`} ]`, `textures/items/speed${speed.indexOf(data.speed) === 4 ? '4' : speed.indexOf(data.speed) + 1}`)
                    .button(`§r속도 감소\n[ ${data.speed}${speed.indexOf(data.speed) === 0 ? '' : ` -> §c${speed[speed.indexOf(data.speed) - 1]}§r`} ]`, `textures/items/speed${speed.indexOf(data.speed) === 0 ? '0' : speed.indexOf(data.speed) - 1}`)
                    .button(`${isPolice ? `§r사이렌\n[ ${data.siren ? '§coff§r' : '§aon§r'} ]` : '시동 끄기'}`, `textures/items/${isPolice ? `siren_${data.siren ? 'off' : 'on'}` : 'car_off'}`);
                if (isPolice) {
                    ui.button('시동 끄기', 'textures/items/car_off');
                }
                if (!hasKey(player, target)) {
                    return;
                } // 키 소지
                ui.show(player).then(response => {
                    if (response.canceled) {
                        return;
                    }
                    switch (response.selection) {
                        case 0: {
                            target.triggerEvent(data.enableFriend ? 'door_close' : 'door_open');
                            data.enableFriend = !data.enableFriend;
                            entityData.enableFriend = data.enableFriend;
                            world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
                            saveData(target.id, entityData);
                            break;
                        }
                        case 1: {
                            if (data.headLight === true) {
                                target.triggerEvent("light_on");
                                data.headLight = false;
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
                            }
                            else {
                                target.triggerEvent("light_off");
                                data.headLight = true;
                                data.left_signal = false;
                                data.right_signal = false;
                                data.window = true;
                                data.siren = false;
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
                            }
                            break;
                        }
                        case 2: {
                            if (data.left_signal === true) {
                                target.triggerEvent("left_signal_off");
                                data.left_signal = false;
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
                            }
                            else {
                                target.triggerEvent("left_signal_on");
                                data.headLight = false;
                                data.left_signal = true;
                                data.right_signal = false;
                                data.window = true;
                                data.siren = false;
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
                            }
                            break;
                        }
                        case 3: {
                            if (data.right_signal === true) {
                                target.triggerEvent("right_signal_off");
                                data.right_signal = false;
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
                            }
                            else {
                                target.triggerEvent("right_signal_on");
                                data.headLight = false;
                                data.left_signal = false;
                                data.right_signal = true;
                                data.window = true;
                                data.siren = false;
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
                            }
                            break;
                        }
                        case 4: {
                            if (data.window === true) {
                                target.triggerEvent("roll_down");
                                data.headLight = false;
                                data.left_signal = false;
                                data.right_signal = false;
                                data.window = false;
                                data.siren = false;
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
                            }
                            else {
                                target.triggerEvent("roll_up");
                                data.window = true;
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
                            }
                            break;
                        }
                        case 5: {
                            if (speed.indexOf(data.speed) === 4) {
                                player.sendMessage(`§4최대 속력입니다.`);
                            }
                            else {
                                target.triggerEvent(`speed${speed.indexOf(data.speed) + 1}`);
                                data.speed = speed[speed.indexOf(data.speed) + 1];
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
                                target.playAnimation(`animation.tosca.dummy${speed.indexOf(data.speed)}`);
                            }
                            break;
                        }
                        case 6: {
                            if (speed.indexOf(data.speed) === 0) {
                                player.sendMessage(`§4최소 속력입니다.`);
                            }
                            else {
                                target.triggerEvent(`speed${speed.indexOf(data.speed) - 1}`);
                                data.speed = speed[speed.indexOf(data.speed) - 1];
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
                                target.playAnimation(`animation.tosca.dummy${speed.indexOf(data.speed)}`);
                            }
                            break;
                        }
                        case 7: {
                            if (isPolice) {
                                if (data.siren === true) {
                                    target.triggerEvent("siren_off");
                                    data.siren = false;
                                    world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
                                }
                                else {
                                    target.triggerEvent("siren_on");
                                    data.headLight = false;
                                    data.left_signal = false;
                                    data.right_signal = false;
                                    data.window = true;
                                    data.siren = true;
                                    world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
                                }
                            }
                            else {
                                const data2 = {
                                    headLight: false, // 헤드라이트
                                    left_signal: false, // 좌 신호등
                                    right_signal: false, // 우 신호등
                                    window: true, //창문
                                    speed: 30,
                                    siren: false
                                };
                                entityData.option = false;
                                entityData.ride2 = false;
                                target.triggerEvent(`back_mirror_close2`);
                                target.getComponent(EntityMovementComponent.componentId)?.setCurrentValue(0);
                                saveData(target.id, entityData);
                                saveData("car:" + target.id, data2);
                            }
                            break;
                        }
                        case 8: {
                            const data2 = {
                                headLight: false, // 헤드라이트
                                left_signal: false, // 좌 신호등
                                right_signal: false, // 우 신호등
                                window: true, //창문
                                speed: 30,
                                siren: false
                            };
                            entityData.option = false;
                            entityData.ride2 = false;
                            target.triggerEvent(`back_mirror_close`);
                            target.getComponent(EntityMovementComponent.componentId)?.setCurrentValue(0);
                            saveData(target.id, entityData);
                            saveData("car:" + target.id, data2);
                            break;
                        }
                    }
                });
            });
        }
        else {
            if (!hasKey(player, target)) {
                return;
            }
            system.run(() => {
                new ActionFormData()
                    .title(`차`)
                    .button(`시동 켜기`, 'textures/items/car_on')
                    .show(player).then(res => {
                    if (res.canceled)
                        return;
                    switch (res.selection) {
                        case 0: {
                            entityData.option = true;
                            target.triggerEvent("back_mirror_open");
                            target.triggerEvent(`speed0`);
                            saveData(target.id, entityData);
                            break;
                        }
                    }
                });
            });
        }
    }
    else if (itemStack?.typeId == "key:dw_tosca_key" && itemStack?.getLore()[0]?.slice(14) == target.id) {
        e.cancel = true;
        openui(player, entityData);
    }
    if (itemStack?.getLore()[0]?.slice(14) != target.id) {
        e.cancel = true;
    }
});
world.beforeEvents.playerInteractWithEntity.subscribe(e => {
    const { itemStack, player, target } = e;
    // 차량 치장 아이템 사용
    if (itemStack) {
        if (target.typeId === 'cybox:dw_tosca') {
            if (Object.keys(KIT_EVENT).includes(itemStack.typeId)) {
                e.cancel = true;
                if (hasKey(player, target)) {
                    system.run(() => {
                        target.triggerEvent(KIT_EVENT[itemStack.typeId]);
                        player.runCommand(`clear @s ${itemStack.typeId} 0 1`);
                    });
                }
            }
        }
    }
});
