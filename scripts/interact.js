import { system, world } from "@minecraft/server";
import { readData, saveData } from "./db";
import { openui, openui2 } from "./function";
import { ActionFormData } from "@minecraft/server-ui";
world.beforeEvents.playerInteractWithEntity.subscribe(e => {
    const { itemStack, player, target } = e;
    if (target.typeId != "cybox:dw_tosca" || itemStack?.typeId === "cybox:dw_tosca_spawn_egg" || itemStack?.typeId.startsWith(`cybox:`)) {
        return;
    }
    const rid = target.getComponent(`minecraft:rideable`);
    const datas = readData(target.id);
    if (itemStack?.typeId != "key:dw_tosca_key" && ((!datas.ride2 && player.id !== datas.plid))) {
        e.cancel = true;
        console.warn(`cancel`);
        return;
    }
    else if (itemStack?.typeId != "key:dw_tosca_key" && (!datas.ride && datas.ride2 && player.id === datas.plid)) {
        datas.ride = true;
        datas.ride2 = false;
        console.warn("a");
        system.run(() => {
            target.triggerEvent("right_front_door_close");
            target.triggerEvent(`car_stop`);
        });
        saveData(target.id, datas);
        return;
    }
    if (itemStack?.typeId == "key:dw_tosca_key" && datas.ride2 && !datas.ride && datas.plid === player.id) {
        e.cancel = true;
        openui2(player, datas);
        return;
    }
    //if (itemStack?.typeId == "key:dw_tosca_key" && itemStack?.getLore()[0].slice(14) == target.id) {
    if (rid.getRiders()[0]?.id === player.id && rid.getRiders()[0]?.id === datas.plid && datas.ride) {
        let entity = target;
        e.cancel = true;
        if (datas.option) {
            if (!world?.getDynamicProperty(`car:${entity.id}`)) {
                world.setDynamicProperty(`car:${entity.id}`, JSON.stringify({
                    headLight: false, // 헤드라이트
                    left_signal: false, // 좌 신호등
                    right_signal: false, // 우 신호등
                    window: true, //창문
                    speed: 30,
                    siren: false
                }));
            }
            const speed = [30, 70, 100, 150, 220];
            const data = JSON.parse(world.getDynamicProperty(`car:${entity.id}`));
            system.run(() => {
                function optionUi() {
                    const isPolice = entity.hasTag("police");
                    const ui = new ActionFormData()
                        .title('차')
                        .button(`§헤드라이트 끄기\n[ ${data.headLight ? '§coff§r' : '§aon§r'} ]`, `textures/items/headlight_${data.headLight ? 'off' : 'on'}`)
                        .button(`§r좌측 신호등\n[ ${data.left_signal ? '§coff§r' : '§aon§r'} ]`, `textures/items/left_signal_${data.left_signal ? 'off' : 'on'}`)
                        .button(`§r우측 신호등\n[ ${data.right_signal ? '§coff§r' : '§aon§r'} ]`, `textures/items/right_signal_${data.right_signal ? 'off' : 'on'}`)
                        .button(`§r창문\n[ ${data.window ? '§aopen§r' : '§cclose§r'} ]`, `textures/items/roll_${data.window ? 'down' : 'up'}`)
                        .button(`§r속도 증가\n[ ${data.speed}${speed.indexOf(data.speed) === 4 ? '' : ` -> §a${speed[speed.indexOf(data.speed) + 1]}§r`} ]`, `textures/items/speed${speed.indexOf(data.speed) === 4 ? '4' : speed.indexOf(data.speed) + 1}`)
                        .button(`§r속도 감소\n[ ${data.speed}${speed.indexOf(data.speed) === 0 ? '' : ` -> §c${speed[speed.indexOf(data.speed) - 1]}§r`} ]`, `textures/items/speed${speed.indexOf(data.speed) === 0 ? '0' : speed.indexOf(data.speed) - 1}`)
                        .button(`${isPolice ? `§r사이렌\n[ ${data.siren ? '§con§r' : '§aoff§r'} ]` : '시동 끄기'}`, `textures/items/${isPolice ? `siren_${data.siren ? 'off' : 'on'}` : 'car_off'}`);
                    if (isPolice) {
                        ui.button('시동 끄기', 'textures/items/car_off');
                    }
                    ui.show(player).then(response => {
                        if (response.canceled) {
                            return;
                        }
                        switch (response.selection) {
                            case 0: {
                                if (data.headLight === true) {
                                    entity.triggerEvent("light_off");
                                    data.headLight = false;
                                    world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(data));
                                }
                                else {
                                    entity.triggerEvent("light_on");
                                    data.headLight = true;
                                    data.left_signal = false;
                                    data.right_signal = false;
                                    data.window = true;
                                    data.siren = false;
                                    world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(data));
                                }
                                optionUi();
                                break;
                            }
                            case 1: {
                                if (data.left_signal === true) {
                                    entity.triggerEvent("left_signal_off");
                                    data.left_signal = false;
                                    world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(data));
                                }
                                else {
                                    entity.triggerEvent("left_signal_on");
                                    data.headLight = false;
                                    data.left_signal = true;
                                    data.right_signal = false;
                                    data.window = true;
                                    data.siren = false;
                                    world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(data));
                                }
                                optionUi();
                                break;
                            }
                            case 2: {
                                if (data.right_signal === true) {
                                    entity.triggerEvent("right_signal_off");
                                    data.right_signal = false;
                                    world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(data));
                                }
                                else {
                                    entity.triggerEvent("right_signal_on");
                                    data.headLight = false;
                                    data.left_signal = false;
                                    data.right_signal = true;
                                    data.window = true;
                                    data.siren = false;
                                    world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(data));
                                }
                                optionUi();
                                break;
                            }
                            case 3: {
                                if (data.window === true) {
                                    entity.triggerEvent("roll_down");
                                    data.headLight = false;
                                    data.left_signal = false;
                                    data.right_signal = false;
                                    data.window = false;
                                    data.siren = false;
                                    world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(data));
                                }
                                else {
                                    entity.triggerEvent("roll_up");
                                    data.window = true;
                                    world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(data));
                                }
                                optionUi();
                                break;
                            }
                            case 4: {
                                if (speed.indexOf(data.speed) === 4) {
                                    player.sendMessage(`§4최대 속력입니다.`);
                                }
                                else {
                                    entity.triggerEvent(`speed${speed.indexOf(data.speed) + 1}`);
                                    data.speed = speed[speed.indexOf(data.speed) + 1];
                                    world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(data));
                                }
                                optionUi();
                                break;
                            }
                            case 5: {
                                if (speed.indexOf(data.speed) === 0) {
                                    player.sendMessage(`§4최소 속력입니다.`);
                                }
                                else {
                                    entity.triggerEvent(`speed${speed.indexOf(data.speed) - 1}`);
                                    data.speed = speed[speed.indexOf(data.speed) - 1];
                                    world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(data));
                                }
                                optionUi();
                                break;
                            }
                            case 6: {
                                if (isPolice) {
                                    if (data.siren === true) {
                                        entity.triggerEvent("siren_off");
                                        data.siren = false;
                                        world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(data));
                                    }
                                    else {
                                        entity.triggerEvent("siren_on");
                                        data.headLight = false;
                                        data.left_signal = false;
                                        data.right_signal = false;
                                        data.window = true;
                                        data.siren = true;
                                        world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(data));
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
                                    datas.option = false;
                                    datas.ride2 = false;
                                    entity.triggerEvent(`back_mirror_close2`);
                                    saveData(entity.id, datas);
                                    saveData("car:" + entity.id, data2);
                                    break;
                                }
                            }
                            case 7: {
                                const data2 = {
                                    headLight: false, // 헤드라이트
                                    left_signal: false, // 좌 신호등
                                    right_signal: false, // 우 신호등
                                    window: true, //창문
                                    speed: 30,
                                    siren: false
                                };
                                datas.option = false;
                                datas.ride2 = false;
                                entity.triggerEvent(`back_mirror_close`);
                                saveData(entity.id, datas);
                                saveData("car:" + entity.id, data2);
                                break;
                            }
                        }
                    });
                }
                optionUi();
            });
        }
        else {
            system.run(() => {
                new ActionFormData()
                    .title(`차`)
                    .button(`시동 켜기`, 'textures/items/car_on')
                    .show(player).then(res => {
                    if (res.canceled)
                        return;
                    if (res.selection === 0) {
                        datas.option = true;
                        entity.triggerEvent("back_mirror_open");
                        saveData(entity.id, datas);
                    }
                });
            });
        }
    }
    else if (itemStack?.typeId == "key:dw_tosca_key" && itemStack?.getLore()[0].slice(14) == target.id) {
        e.cancel = true;
        openui(player, datas);
    }
    if (itemStack?.getLore()[0].slice(14) != target.id) {
        e.cancel = true;
    }
});
