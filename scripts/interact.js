import { system, world } from "@minecraft/server";
import { readData, saveData } from "./db";
import { openui, playAni } from "./function";
import { ActionFormData } from "@minecraft/server-ui";
world.beforeEvents.playerInteractWithEntity.subscribe(e => {
    const { itemStack, player, target } = e;
    if (target.typeId != "cybox:dw_tosca" || itemStack?.typeId === "cybox:dw_tosca_spawn_egg" || itemStack?.typeId.startsWith(`cybox:`)) {
        return;
    }
    const rid = target.getComponent(`minecraft:rideable`);
    const data = readData(target.id);
    if (itemStack?.typeId != "key:dw_tosca_key" && ((!data.ride2 && player.id !== data.plid) || !data.ride2)) {
        e.cancel = true;
        console.warn(`cancel`);
        return;
    }
    else if (itemStack?.typeId != "key:dw_tosca_key" && (!data.ride && data.ride2 && player.id === data.plid)) {
        data.ride = true;
        data.ride2 = false;
        console.warn("a");
        system.run(() => {
            target.triggerEvent(`right_front_door_open`);
        });
        saveData(target.id, data);
        return;
    }
    if (itemStack?.typeId == "key:dw_tosca_key" && itemStack?.getLore()[0].slice(14) == target.id) {
        e.cancel = true;
        if (rid.getRiders()[0]?.id === player.id || rid.getRiders()[0]?.id === data.plid || data.ride) {
            let entity = target;
            if (!world?.getDynamicProperty(`car:${entity.id}`)) {
                world.setDynamicProperty(`car:${entity.id}`, JSON.stringify({
                    headLight: false, // 헤드라이트
                    left_signal: false, // 좌 신호등
                    right_signal: false, // 우 신호등
                    window: true, //창문
                    speed: 30
                }));
            }
            const speed = [30, 70, 100, 150, 220];
            const data = JSON.parse(world.getDynamicProperty(`car:${entity.id}`));
            system.run(() => {
                function optionUi() {
                    new ActionFormData()
                        .title('차')
                        .button(`§r헤드라이트\n[ ${data.headLight ? '§coff§r' : '§aon§r'} ]`, `textures/items/headlight_${data.headLight ? 'off' : 'on'}`)
                        .button(`§r좌측 신호등\n[ ${data.left_signal ? '§coff§r' : '§aon§r'} ]`, `textures/items/left_signal_${data.left_signal ? 'off' : 'on'}`)
                        .button(`§r우측 신호등\n[ ${data.right_signal ? '§coff§r' : '§aon§r'} ]`, `textures/items/right_signal_${data.right_signal ? 'off' : 'on'}`)
                        .button(`§r창문\n[ ${data.window ? '§aopen§r' : '§cclose§r'} ]`, `textures/items/roll_${data.window ? 'down' : 'up'}`)
                        .button(`§r속도 증가\n[ ${data.speed}${speed.indexOf(data.speed) === 4 ? '' : ` -> §a${speed[speed.indexOf(data.speed) + 1]}§r`} ]`, `textures/items/speed${speed.indexOf(data.speed) === 4 ? '4' : speed.indexOf(data.speed) + 1}`)
                        .button(`§r속도 감소\n[ ${data.speed}${speed.indexOf(data.speed) === 0 ? '' : ` -> §c${speed[speed.indexOf(data.speed) - 1]}§r`} ]`, `textures/items/speed${speed.indexOf(data.speed) === 0 ? '0' : speed.indexOf(data.speed) - 1}`)
                        .show(player).then(response => {
                        if (response.canceled) {
                            return;
                        }
                        switch (response.selection) {
                            case 0: {
                                if (data.headLight === true) {
                                    playAni(player, "light_off");
                                    data.headLight = false;
                                    world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(data));
                                }
                                else {
                                    playAni(player, "light_on");
                                    data.headLight = true;
                                    world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(data));
                                }
                                optionUi();
                                break;
                            }
                            case 1: {
                                if (data.left_signal === true) {
                                    playAni(player, "left_signal_off");
                                    data.left_signal = false;
                                    world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(data));
                                }
                                else {
                                    playAni(player, "left_signal_on");
                                    data.left_signal = true;
                                    world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(data));
                                }
                                optionUi();
                                break;
                            }
                            case 2: {
                                if (data.right_signal === true) {
                                    playAni(player, "right_signal_off");
                                    data.right_signal = false;
                                    world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(data));
                                }
                                else {
                                    playAni(player, "right_signal_on");
                                    data.right_signal = true;
                                    world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(data));
                                }
                                optionUi();
                                break;
                            }
                            case 3: {
                                if (data.window === true) {
                                    playAni(player, "roll_down");
                                    data.window = false;
                                    world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(data));
                                }
                                else {
                                    playAni(player, "roll_up");
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
                                    playAni(player, `speed${speed.indexOf(data.speed) + 1}`);
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
                                    playAni(player, `speed${speed.indexOf(data.speed) - 1}`);
                                    data.speed = speed[speed.indexOf(data.speed) - 1];
                                    world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(data));
                                }
                                optionUi();
                                break;
                            }
                        }
                    });
                }
                optionUi();
            });
        }
        else {
            openui(player, data);
        }
    }
    else if (itemStack?.getLore()[0].slice(14) != target.id) {
        e.cancel = true;
    }
});
