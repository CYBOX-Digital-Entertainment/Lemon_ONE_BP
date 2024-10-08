import { EntityMovementComponent, system, world } from "@minecraft/server";
import { readData, saveData } from "./db";
import { KIT_EVENT, hasKey, openui, openui2, repairItems } from "./function";
import { ActionFormData } from "@minecraft/server-ui";
import { carInfoObj, carNameList } from "./settings";
import { EntityData } from "./class";

function getOriginEntity(trid){
    for(let id of world.getDynamicPropertyIds()){
        const data = JSON.parse(world.getDynamicProperty(id));
        
        if(data == undefined) continue;
        console.warn(data.trid == trid);
        
        if(data.trid == trid) return world.getEntity(data.entid)
    }
}

world.beforeEvents.playerInteractWithEntity.subscribe(e => {
    const { itemStack, player, target } = e;
    if (itemStack) {
        if (carNameList().includes(target.typeId)) {
            if (Object.keys(KIT_EVENT).includes(itemStack.typeId)) { // 차량 치장 아이템 사용
                e.cancel = true;
                if (hasKey(player, target)) {
                    system.run(() => {
                        target.triggerEvent(KIT_EVENT[itemStack.typeId]);
                        player.runCommand(`clear @s ${itemStack.typeId} 0 1`);
                        world.playSound('dwt_car_spray', player.location);
                    });
                }
            }
            else if (repairItems.includes(itemStack.typeId)) {
                e.cancel = false;
                return;
            }
        }
    }
    // if (target.typeId != "cybox:dw_tosca" || itemStack?.typeId === "cybox:dw_tosca_spawn_egg" || itemStack?.typeId.startsWith(`cybox:`)) {
    //     return;
    // }
    const rid = target.getComponent(`minecraft:rideable`);
    const entityData = readData(target.id);
    let entity;
    if(entityData == undefined){
        entity = getOriginEntity(target.id);
    } else {
        entity = world.getEntity(entityData.entid);
    }
    console.warn(JSON.stringify(entityData));
    
    
    // const car = getOriginEntityTypeIdFromTr(target.typeId);
    // console.warn(JSON.stringify(car));
    const carInfo = carInfoObj[entity.typeId];
    
    if (carInfo.key != itemStack?.typeId&& !entityData?.ride2 && player.id !== entityData?.plid) {
        if (rid.getRiders().length && entityData.enableFriend) {
            return;
        }
        e.cancel = true;
        return;
    } else if (carInfo.key != itemStack?.typeId && (!entityData.ride && entityData.ride2 && player.id === entityData.plid)) {
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
    if (carInfo.key != itemStack?.typeId && entityData.ride2 && !entityData.ride && entityData.plid === player.id) {
        e.cancel = true;
        openui2(player, entityData);
        return;
    }
    //if (itemStack?.typeId == "key:dw_tosca_key" && itemStack?.getLore()[0].slice(14) == target.id) {
    if (rid.getRiders()[0]?.id == player.id && entityData.ride && itemStack?.typeId.includes('minecraft:music_disc_') == true) {
        if (!world?.getDynamicProperty(`car:${target.id}`)) {
            world.setDynamicProperty(`car:${target.id}`, JSON.stringify({
                headLight: false, // 헤드라이트
                left_signal: false, // 좌 신호등
                right_signal: false, // 우 신호등
                window: true, //창문
                speed: 30,
                siren: false,
                mode: 0,
            }));
        }
        const data = JSON.parse(world.getDynamicProperty(`car:${target.id}`));
        const music = itemStack.typeId.replace('minecraft:music_disc_', '');
    }
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
                    siren: false,
                    mode: 0
                }));
            }
            const speed = [30, 70, 100, 150, 220];
            const data = JSON.parse(world.getDynamicProperty(`car:${target.id}`));
            if (carInfo.esterEgg != undefined &&itemStack?.typeId == carInfo.esterEgg && data.credit == undefined) {
                data.credit = true;
                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
                system.run(() => {
                    target.triggerEvent('credit');
                });
                system.runTimeout(() => {
                    target.triggerEvent(`light_on`);
                    target.triggerEvent(`sound_off`);
                }, 400);
                return;
            }
            system.run(() => {
                if (itemStack?.typeId.includes('music_disc_')) {
                    const music = itemStack.typeId.replace('minecraft:music_disc_', '');
                    if (data.disc != undefined) {
                        player.runCommandAsync(`give @s music_disc_${data.disc}`);
                        rid.getRiders().forEach(entity => {
                            target.triggerEvent(`sound_off`);
                            entity.runCommandAsync(`stopsound @s record.${data.disc}`);
                            const k = data.disc;
                            system.runTimeout(() => {
                                entity.runCommandAsync(`stopsound @s record.${k}`);
                            }, 60);
                        });
                        data.disc = undefined;
                    }
                    data.disc = music;
                    world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
                    player.getComponent(`inventory`)?.container?.setItem(player.selectedSlotIndex);
                    target.triggerEvent(`${music}_loading`);
                    system.runTimeout(() => {
                        if (music == 'pigstep') {
                            target.triggerEvent(`pigstep_on`);
                        }
                        else if (music == '13') {
                            target.triggerEvent(`13_on`);
                        }
                        else {
                            target.triggerEvent(`song_on`);
                        }
                        rid.getRiders().forEach((entity) => {
                            entity.runCommandAsync(`playsound record.${music}`);
                        });
                    }, 58);
                    return;
                }
                const isPolice = target.hasTag("police");
                const buttons = [
                    [{ rawtext: [{ translate: `car.at` }] }, 'textures/items/at_icon'],
                    [{ rawtext: [{ translate: `car.horn` }] }, 'textures/items/car_horn'],
                    [{ rawtext: [{ translate: 'car.door_open_other' }, { text: `\n[ ${data.enableFriend ? '§coff§r' : '§aon§r'} ]` }] }, `textures/items/door_${data.enableFriend ? 'open' : 'close'}`],
                    [{ rawtext: [{ translate: 'car.headlight' }, { text: `\n[ ${data.headLight ? '§coff§r' : '§aon§r'} ]` }] }, `textures/items/headlight_${data.headLight ? 'off' : 'on'}`],
                    [{ rawtext: [{ translate: 'car.left_turn_signal' }, { text: `\n[ ${data.left_signal ? '§coff§r' : '§aon§r'} ]` }] }, `textures/items/left_signal_${data.left_signal ? 'off' : 'on'}`],
                    [{ rawtext: [{ translate: 'car.right_turn_signal' }, { text: `\n[ ${data.right_signal ? '§coff§r' : '§aon§r'} ]` }] }, `textures/items/right_signal_${data.right_signal ? 'off' : 'on'}`],
                    [{ rawtext: [{ translate: 'car.window' }, { text: `\n[ ${data.window ? '§aopen§r' : '§cclose§r'} ]` }] }, `textures/items/roll_${data.window ? 'down' : 'up'}`],
                    [{ rawtext: [{ translate: 'car.speedup' }, { text: `\n[ ${data.speed}${speed.indexOf(data.speed) === 4 ? '' : ` -> §a${speed[speed.indexOf(data.speed) + 1]}§r`} ]` }] }, `textures/items/speed${speed.indexOf(data.speed) === 4 ? '4' : speed.indexOf(data.speed) + 1}`],
                    [{ rawtext: [{ translate: 'car.speeddown' }, { text: `\n[ ${data.speed}${speed.indexOf(data.speed) === 0 ? '' : ` -> §c${speed[speed.indexOf(data.speed) - 1]}§r`} ]` }] }, `textures/items/speed${speed.indexOf(data.speed) === 0 ? '0' : speed.indexOf(data.speed) - 1}`],
                    [{ rawtext: [{ translate: isPolice ? "car.siren" : "car.off" }, { text: isPolice ? `\n[ ${data.siren ? '§coff§r' : '§aon§r'} ]` : "" }] }, `textures/items/${isPolice ? `siren_${data.siren ? 'off' : 'on'}` : 'car_off'}`],
                ];
                const ui = new ActionFormData().title('car.ui_title');
                if (data.enableFriend == undefined)
                    data.enableFriend = false;
                if (data.enableFriend == true) {
                    buttons.splice(3, 4);
                }
                else if (data.headLight == true) {
                    buttons.splice(2, 1);
                    buttons.splice(3, 3);
                }
                else if (data.left_signal == true || data.right_signal == true) {
                    buttons.splice(2, 2);
                    buttons.splice(4, 1);
                }
                else if (data.window == false) {
                    buttons.splice(2, 4);
                }
                else if (data?.siren == true) {
                    buttons.splice(2, 5);
                }
                if (data.disc != undefined) {
                    buttons.splice(2, 0, [{ rawtext: [{ translate: `car.cd_eject` }] }, 'textures/items/cd_eject']);
                }
                if (isPolice) {
                    buttons.push([{ rawtext: [{ translate: `car.off` }] }, 'textures/items/car_off']);
                }
                buttons.forEach(d => {
                    if (typeof d[1] != "string")
                        return;
                    ui.button(d[0], d[1]);
                });
                if (!hasKey(player, target)) {
                    return;
                } // 키 소지
                const setSpeed = (sp) => {
                    let speeds = [50, 75, 100, 147, 200]
                    entity.getComponent("movement").setCurrentValue(speeds[speed.indexOf(sp)] * 0.005)
                    console.warn(speeds[speed.indexOf(sp)] * 0.005);
                }
                
                ui.show(player).then(response => {
                    if (response.canceled || response.selection == undefined) {
                        return;
                    }
                    if (typeof buttons[response.selection][0] == 'string')
                        return;
                    const sel = buttons[response.selection][0].rawtext;
                    if (sel == undefined)
                        return;
                    switch (sel[0].translate) {
                        case `car.door_open_other`: {
                            target.triggerEvent(data.enableFriend ? 'door_close' : 'door_open');
                            data.enableFriend = !data.enableFriend;
                            entityData.enableFriend = data.enableFriend;
                            world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
                            saveData(target.id, entityData);
                            break;
                        }
                        case `car.headlight`: {
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
                                target.runCommandAsync(`fill ~3 ~3 ~3 ~-3 ~-3 ~-3 air replace light_block`);
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
                            }
                            break;
                        }
                        case `car.left_turn_signal`: {
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
                        case `car.right_turn_signal`: {
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
                        case `car.window`: {
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
                        case `car.speedup`: {
                            if (data.mode == 0 || data.mode == 1) {
                                player.sendMessage({ rawtext: [{ translate: `car.at_notice_p_r` }] });
                                break;
                            }
                            if (speed.indexOf(data.speed) === 4) {
                                player.sendMessage({ rawtext: [{ translate: `car.speedup_notice_max` }] });
                            }
                            else {
                                
                                target.triggerEvent(`speed${speed.indexOf(data.speed) + 1}`);
                                data.speed = speed[speed.indexOf(data.speed) + 1];
                                setSpeed(data.speed)
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
                                target.playAnimation(`animation.tosca.dummy${speed.indexOf(data.speed)}`);
                            }
                            break;
                        }
                        case `car.speeddown`: {
                            if (speed.indexOf(data.speed) === 0) {
                                player.sendMessage({ rawtext: [{ translate: `car.speeddown_notice_max` }] });
                            }
                            else {
                                target.triggerEvent(`speed${speed.indexOf(data.speed) - 1}`);
                                data.speed = speed[speed.indexOf(data.speed) - 1];
                                setSpeed(data.speed)
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
                                target.playAnimation(`animation.tosca.dummy${speed.indexOf(data.speed)}`);
                            }
                            break;
                        }
                        case `${isPolice ? "car.siren" : "car.off"}`: {
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
                                    siren: false,
                                    mode: 0
                                };
                                entityData.option = false;
                                entityData.ride2 = false;
                                console.warn(target.typeId);
                                
                                system.run(()=>{
                                    target.triggerEvent(`back_mirror_close2`);
                                })
                                target.getComponent(EntityMovementComponent.componentId)?.setCurrentValue(0);
                                if(data.disc != undefined) player.runCommandAsync(`give @s music_disc_${data.disc}`);
                                rid.getRiders().forEach(entity => {
                                    target.triggerEvent(`light_on`);
                                    entity.runCommandAsync(`stopsound @s record.${data.disc}`);
                                    const k = data.disc;
                                    system.runTimeout(() => {
                                        entity.runCommandAsync(`stopsound @s record.${k}`);
                                    }, 60);
                                });
                                saveData(target.id, entityData);
                                saveData("car:" + target.id, data2);
                            }
                            break;
                        }
                        case 'car.horn': {
                            world.playSound('dwt_car_horn', target.location, { volume: 10 });
                            break;
                        }
                        case 'car.off': {
                            const data2 = {
                                headLight: false, // 헤드라이트
                                left_signal: false, // 좌 신호등
                                right_signal: false, // 우 신호등
                                window: true, //창문
                                speed: 30,
                                siren: false,
                                mode: 0
                            };
                            entityData.option = false;
                            entityData.ride2 = false;
                            target.triggerEvent(`back_mirror_close2`);
                            target.getComponent(EntityMovementComponent.componentId)?.setCurrentValue(0);
                            if(data.disc != undefined) player.runCommandAsync(`give @s music_disc_${data.disc}`);
                            rid.getRiders().forEach(entity => {
                                target.triggerEvent(`light_on`);
                                entity.runCommandAsync(`stopsound @s record.${data.disc}`);
                                const k = data.disc;
                                system.runTimeout(() => {
                                    entity.runCommandAsync(`stopsound @s record.${k}`);
                                }, 60);
                            });
                            saveData(target.id, entityData);
                            saveData("car:" + target.id, data2);
                            break;
                        }
                        case 'car.at': {
                            const actionform = new ActionFormData().title('car.at');
                            const l = ['P', 'R', 'N', 'D'];
                            l[data.mode] = '§c' + l[data.mode];
                            l.forEach(x => {
                                actionform.button(x);
                            });
                            actionform.show(player).then(res => {
                                if (res.canceled == true)
                                    return;
                                data.mode = res.selection;
                                if (res.selection == 0) {
                                    target.triggerEvent('at_p');
                                    target.triggerEvent('speed0');
                                    target.triggerEvent('neutral_off');
                                    data.speed = 30;
                                }
                                else if (res.selection == 1) {
                                    target.triggerEvent('at_r');
                                    target.triggerEvent('speed0');
                                    target.triggerEvent('neutral_off');
                                    target.triggerEvent(`speed0`);
                                    setSpeed(data.speed);
                                }
                                else if (res.selection == 2) {
                                    target.triggerEvent('neutral_on');
                                    data.speed = 30;
                                }
                                else if (res.selection == 3) {
                                    target.triggerEvent('at_d');
                                    target.triggerEvent(`speed0`);
                                    setSpeed(data.speed);
                                }
                                saveData("car:" + target.id, data);
                            });
                            break;
                        }
                        case 'car.cd_eject': {
                            player.runCommandAsync(`give @s music_disc_${data.disc}`);
                            rid.getRiders().forEach(entity => {
                                target.triggerEvent(`light_on`);
                                entity.runCommandAsync(`stopsound @s record.${data.disc}`);
                                const k = data.disc;
                                system.runTimeout(() => {
                                    entity.runCommandAsync(`stopsound @s record.${k}`);
                                }, 60);
                            });
                            data.disc = undefined;
                            world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
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
                    .title(`car.ui_title`)
                    .button(`car.on`, 'textures/items/car_on')
                    .show(player).then(res => {
                    if (res.canceled)
                        return;
                    switch (res.selection) {
                        case 0: {
                            entityData.option = true;
                            target.triggerEvent("back_mirror_open");
                            saveData(target.id, entityData);
                            break;
                        }
                    }
                });
            });
        }
    }
    else if (itemStack?.typeId == carInfo.key && itemStack?.getLore()[0]?.slice(14) == target.id) {
        e.cancel = true;
        openui(player, entityData);
    }
    if (itemStack?.getLore()[0]?.slice(14) != target.id) {
        e.cancel = true;
    }
});
