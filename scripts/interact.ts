import { EntityMovementComponent, EntityRideableComponent, Player, system, world } from "@minecraft/server";
import { readData, saveData } from "./db"
import { KIT_EVENT, hasKey, openui, openui2, repairItems } from "./function"
import { EntityData } from "./class"
import { ActionFormData } from "@minecraft/server-ui";

world.beforeEvents.playerInteractWithEntity.subscribe(e => {
    const { itemStack, player, target } = e

    if (itemStack) {
        if (target.typeId === 'cybox:dw_tosca') {
            if (Object.keys(KIT_EVENT).includes(itemStack.typeId)) { // 차량 치장 아이템 사용
                e.cancel = true;
                if (hasKey(player, target)) {
                    system.run(() => {
                        target.triggerEvent(KIT_EVENT[itemStack.typeId])
                        player.runCommand(`clear @s ${itemStack.typeId} 0 1`)
                        world.playSound('dwt_car_spray', player.location)
                    })
                }
            } else if(repairItems.includes(itemStack.typeId)) {
                e.cancel = false;
                return;
            }
        }
    }
    // if (target.typeId != "cybox:dw_tosca" || itemStack?.typeId === "cybox:dw_tosca_spawn_egg" || itemStack?.typeId.startsWith(`cybox:`)) {
    //     return;
    // }
    const rid = target.getComponent(`minecraft:rideable`) as EntityRideableComponent
    const entityData = readData(target.id) as EntityData
    if (itemStack?.typeId != "key:dw_tosca_key" && !entityData.ride2 && player.id !== entityData.plid) {
        if (rid.getRiders().length && entityData.enableFriend) {
            return;
        }

        e.cancel = true
        // console.warn(`cancel`)
        return;
    } else if (itemStack?.typeId != "key:dw_tosca_key" && (!entityData.ride && entityData.ride2 && player.id === entityData.plid)) {
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
        e.cancel = true
        openui2(player, entityData)
        return;
    }
    //if (itemStack?.typeId == "key:dw_tosca_key" && itemStack?.getLore()[0].slice(14) == target.id) {
    if(rid.getRiders()[0]?.id == player.id && entityData.ride && itemStack?.typeId.includes('minecraft:music_disc_') == true){
        if (!world?.getDynamicProperty(`car:${target.id}`)) {
            world.setDynamicProperty(`car:${target.id}`, JSON.stringify({
                headLight: false, // 헤드라이트
                left_signal: false, // 좌 신호등
                right_signal: false,// 우 신호등
                window: true, //창문
                speed: 30,
                siren: false,
                mode : 0,
            }));
        }
        const data = JSON.parse(world.getDynamicProperty(`car:${target.id}`) as string);
        const music = itemStack.typeId.replace('minecraft:music_disc_','');
        
    }

    if (rid.getRiders()[0]?.id === player.id && rid.getRiders()[0]?.id === entityData.plid && entityData.ride) {
        e.cancel = true

        
        if (entityData.option) {
            if (!world?.getDynamicProperty(`car:${target.id}`)) {
                world.setDynamicProperty(`car:${target.id}`, JSON.stringify({
                    headLight: false, // 헤드라이트
                    left_signal: false, // 좌 신호등
                    right_signal: false,// 우 신호등
                    window: true, //창문
                    speed: 30,
                    siren: false,
                    mode : 0
                }));
            }
            const speed = [30, 70, 100, 150, 220];
            const data = JSON.parse(world.getDynamicProperty(`car:${target.id}`) as string);
            // console.warn(itemStack?.typeId,data.credit == undefined);
            
            if(itemStack?.typeId == "cybox:dw_tosca_core" && data.credit == undefined){
                
                data.credit = true;
                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data))
                system.run(()=>{
                    target.triggerEvent('credit');
                    // console.warn('credit on');
                    
                })
                system.runTimeout(()=>{
                    target.triggerEvent(`sound_off`);
                    // console.warn('credit off');
                },400);
                return;
            }

            system.run(() => {
                if(itemStack?.typeId.includes('music_disc_')){
                    const music = itemStack.typeId.replace('minecraft:music_disc_','');
                    if(data.disc != undefined){
                        player.runCommandAsync(`give @s music_disc_${data.disc}`);
                        rid.getRiders().forEach(entity=>{
                            target.triggerEvent(`sound_off`);
                            entity.runCommandAsync(`stopsound @s record.${data.disc}`);
                            const k = data.disc;
                            system.runTimeout(()=>{
                                entity.runCommandAsync(`stopsound @s record.${k}`);
                            },60);
                        })
                        data.disc = undefined;
                    }
                    data.disc = music;
                    world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data))
                    player.getComponent(`inventory`)?.container?.setItem(player.selectedSlot)
                    target.triggerEvent(`${music}_loading`);
                    system.runTimeout(()=>{
                        if(music == 'pigstep'){
                            target.triggerEvent(`pigstep_on`);
                        } else if(music == '13'){
                            target.triggerEvent(`13_on`);
                        } else {
                            target.triggerEvent(`song_on`);
                        }
                        rid.getRiders().forEach((entity)=>{
                            entity.runCommandAsync(`playsound record.${music}`);
                        });
                    },58);
                    return;
                }
                const isPolice = target.hasTag("police");
                const buttons = [
                    [`§rAutomatic Transmission`, `textures/items/at_icon`],
                    [`§rHorn`, `textures/items/car_horn`],
                    [`§rRide Another layer\n[ ${data.enableFriend ? '§coff§r' : '§aon§r'} ]`, `textures/items/door_${data.enableFriend ? 'open' : 'close'}`],
                    [`§rHeadlamp\n[ ${data.headLight ? '§aon§r' : '§coff§r'} ]`, `textures/items/headlight_${data.headLight ? 'off' : 'on'}`],
                    [`§rLeft Turn Signal Lamp\n[ ${data.left_signal ? '§coff§r' : '§aon§r'} ]`, `textures/items/left_signal_${data.left_signal ? 'off' : 'on'}`],
                    [`§rRight ft Turn Signal Lamp\n[ ${data.right_signal ? '§coff§r' : '§aon§r'} ]`, `textures/items/right_signal_${data.right_signal ? 'off' : 'on'}`],
                    [`§rThe driver's window\n[ ${data.window ? '§aopen§r' : '§cclose§r'} ]`, `textures/items/roll_${data.window ? 'down' : 'up'}`],
                    [`§rSpeed up\n[ ${data.speed}${speed.indexOf(data.speed) === 4 ? '' : ` -> §a${speed[speed.indexOf(data.speed) + 1]}§r`} ]`, `textures/items/speed${speed.indexOf(data.speed) === 4 ? '4' : speed.indexOf(data.speed) + 1}`],
                    [`§rSpeed Slow down\n[ ${data.speed}${speed.indexOf(data.speed) === 0 ? '' : ` -> §c${speed[speed.indexOf(data.speed) - 1]}§r`} ]`, `textures/items/speed${speed.indexOf(data.speed) === 0 ? '0' : speed.indexOf(data.speed) - 1}`],
                    [`${isPolice ? `§rSiren\n[ ${data.siren ? '§coff§r' : '§aon§r'} ]` : 'Exit'}`, `textures/items/${isPolice ? `siren_${data.siren ? 'off' : 'on'}` : 'car_off'}`],
                ]
                const ui = new ActionFormData().title('car.ui_title');
                if(data.enableFriend == undefined) data.enableFriend = false;
                
                if(data.enableFriend == true){
                    buttons.splice(3,4);
                } else if(data.headLight == true){
                    buttons.splice(2,1);
                    buttons.splice(3,3);
                } else if(data.left_signal == true || data.right_signal == true){
                    buttons.splice(2,2);
                    buttons.splice(4,1);
                } else if(data.window == false){
                    buttons.splice(2,4);
                } else if(data?.siren == true){
                    buttons.splice(2,5)
                }

                if(data.disc != undefined){
                    buttons.splice(2,0,[`§rEject Disk`, `textures/items/cd_eject`]);
                }

                if (isPolice) {
                    buttons.push([`Exit`, `textures/items/car_off`])
                }

                buttons.forEach(d=>{
                    ui.button(d[0],d[1]);
                })

                if(!hasKey(player, target)){ return; } // 키 소지
                ui.show(player).then(response => {
                    if (response.canceled || response.selection == undefined) {
                        return;
                    }
                    // console.warn(response.selection);
                    
                    switch (buttons[response.selection][0]) {
                        case `§rRide Another layer`: {
                            target.triggerEvent(data.enableFriend ? 'door_close' : 'door_open');
                            data.enableFriend = !data.enableFriend;
                            entityData.enableFriend = data.enableFriend;

                            world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
                            saveData(target.id, entityData);

                            break;
                        }

                        case `§rHeadlamp\n[ ${data.headLight ? '§aon§r' : '§coff§r'} ]`: {
                            if (data.headLight === true) {
                                target.triggerEvent("light_on");
                                data.headLight = false;
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data))
                            } else {
                                target.triggerEvent("light_off");
                                data.headLight = true;
                                data.left_signal = false;
                                data.right_signal = false;
                                data.window = true;
                                data.siren = false;
                                target.runCommandAsync(`fill ~3 ~3 ~3 ~-3 ~-3 ~-3 air replace light_block`);
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data))
                            }

                            break;
                        }

                        case `§rLeft Turn Signal Lamp\n[ ${data.left_signal ? '§coff§r' : '§aon§r'} ]`: {
                            if (data.left_signal === true) {
                                target.triggerEvent("left_signal_off");
                                data.left_signal = false;
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data))
                            } else {
                                target.triggerEvent("left_signal_on");
                                data.headLight = false;
                                data.left_signal = true;
                                data.right_signal = false;
                                data.window = true;
                                data.siren = false;
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data))
                            }

                            break;
                        }

                        case `§rRight Turn Signal Lamp\n[ ${data.right_signal ? '§coff§r' : '§aon§r'} ]`: {
                            if (data.right_signal === true) {
                                target.triggerEvent("right_signal_off");
                                data.right_signal = false;
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data))
                            } else {
                                target.triggerEvent("right_signal_on");
                                data.headLight = false;
                                data.left_signal = false;
                                data.right_signal = true;
                                data.window = true;
                                data.siren = false;
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data))
                            }

                            break;
                        }

                        case `§rThe driver's window\n[ ${data.window ? '§aopen§r' : '§cclose§r'} ]`: {
                            if (data.window === true) {
                                target.triggerEvent("roll_down");
                                data.headLight = false;
                                data.left_signal = false;
                                data.right_signal = false;
                                data.window = false;
                                data.siren = false;
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data))
                            } else {
                                target.triggerEvent("roll_up");
                                data.window = true;
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data))
                            }

                            break;
                        }

                        case `§rSpeed up\n[ ${data.speed}${speed.indexOf(data.speed) === 4 ? '' : ` -> §a${speed[speed.indexOf(data.speed) + 1]}§r`} ]`: {
                            if(data.mode == 0 || data.mode == 1) {
                                player.sendMessage(`In automatic transmission P and R mode, the vehicle speed is limited slowly, please change to D mode to adjust the speed.`);
                                break;
                            }
                            if (speed.indexOf(data.speed) === 4) {
                                player.sendMessage(`The current maximum speed.`)
                            } else {
                                target.triggerEvent(`speed${speed.indexOf(data.speed) + 1}`)
                                data.speed = speed[speed.indexOf(data.speed) + 1];
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data))
                                
                                target.playAnimation(`animation.tosca.dummy${speed.indexOf(data.speed)}`)
                            }

                            break;
                        }

                        case `§rSpeed Slow down\n[ ${data.speed}${speed.indexOf(data.speed) === 0 ? '' : ` -> §c${speed[speed.indexOf(data.speed) - 1]}§r`} ]`: {
                            if (speed.indexOf(data.speed) === 0) {
                                player.sendMessage(`The current minimum speed.`)
                            } else {
                                target.triggerEvent(`speed${speed.indexOf(data.speed) - 1}`)
                                data.speed = speed[speed.indexOf(data.speed) - 1];
                                world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data))

                                target.playAnimation(`animation.tosca.dummy${speed.indexOf(data.speed)}`)
                            }

                            break;
                        }

                        case `${isPolice ? `§rSiren\n[ ${data.siren ? '§coff§r' : '§aon§r'} ]` : 'Exit'}`: {
                            if (isPolice) {
                                if (data.siren === true) {
                                    target.triggerEvent("siren_off");

                                    data.siren = false;
                                    world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data))
                                } else {
                                    target.triggerEvent("siren_on");

                                    data.headLight = false;
                                    data.left_signal = false;
                                    data.right_signal = false;
                                    data.window = true;
                                    data.siren = true;
                                    world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data))
                                }
                            } else {
                                const data2 = {
                                    headLight: false, // 헤드라이트
                                    left_signal: false, // 좌 신호등
                                    right_signal: false,// 우 신호등
                                    window: true, //창문
                                    speed: 30,
                                    siren: false,
                                    mode : 0
                                }
                                entityData.option = false
                                entityData.ride2 = false
                                target.triggerEvent(`back_mirror_close2`)
                                target.getComponent(EntityMovementComponent.componentId)?.setCurrentValue(0)
                                player.runCommandAsync(`give @s music_disc_${data.disc}`);
                                rid.getRiders().forEach(entity=>{
                                    target.triggerEvent(`light_on`);
                                    entity.runCommandAsync(`stopsound @s record.${data.disc}`);
                                    const k = data.disc;
                                    system.runTimeout(()=>{
                                        entity.runCommandAsync(`stopsound @s record.${k}`);
                                    },60);
                                })
                                saveData(target.id, entityData)
                                saveData("car:" + target.id, data2)
                            }

                            break;
                        }

                        case `§rHorn`: {
                            world.playSound('dwt_car_horn', target.location, {volume: 10})

                            break;
                        }

                        case `§rStart`: {
                            const data2 = {
                                headLight: false, // 헤드라이트
                                left_signal: false, // 좌 신호등
                                right_signal: false,// 우 신호등
                                window: true, //창문
                                speed: 30,
                                siren: false,
                                mode : 0
                            }
                            entityData.option = false
                            entityData.ride2 = false
                            target.triggerEvent(`back_mirror_close`)
                            target.getComponent(EntityMovementComponent.componentId)?.setCurrentValue(0)
                            player.runCommandAsync(`give @s music_disc_${data.disc}`);
                            rid.getRiders().forEach(entity=>{
                                target.triggerEvent(`light_on`);
                                entity.runCommandAsync(`stopsound @s record.${data.disc}`);
                                const k = data.disc;
                                system.runTimeout(()=>{
                                    entity.runCommandAsync(`stopsound @s record.${k}`);
                                },60)
                            })
                            saveData(target.id, entityData)
                            saveData("car:" + target.id, data2)
                            break;
                        }

                        case '§rAutomatic Transmission': {
                            const actionform = new ActionFormData().title('§rAutomatic Transmission');
                            const l = ['P','R','N','D'];
                            l[data.mode] = '§c'+l[data.mode];
                            
                            l.forEach(x=>{
                                actionform.button(x);
                            })
                            actionform.show(player).then(res=>{
                                if(res.canceled == true) return;
                                data.mode = res.selection;
                                if(res.selection == 0){
                                    target.triggerEvent('at_p');
                                    target.triggerEvent('speed0');
                                    target.triggerEvent('neutral_off');
                                    data.speed = 30;
                                } else if(res.selection == 1){
                                    target.triggerEvent('at_r');
                                    target.triggerEvent('speed0');
                                    target.triggerEvent('neutral_off');
                                    target.triggerEvent(`speed0`)
                                } else if(res.selection == 2){
                                    target.triggerEvent('neutral_on');
                                    data.speed = 30;
                                } else if(res.selection == 3) {
                                    target.triggerEvent('at_d');
                                    target.triggerEvent(`speed0`)
                                }
                                saveData("car:" + target.id, data);
                            });
                            break;
                        }
                        case '§rEject Disk':{
                            player.runCommandAsync(`give @s music_disc_${data.disc}`);
                            rid.getRiders().forEach(entity=>{
                                target.triggerEvent(`sound_off`);
                                entity.runCommandAsync(`stopsound @s record.${data.disc}`);
                                const k = data.disc;
                                system.runTimeout(()=>{
                                    entity.runCommandAsync(`stopsound @s record.${k}`);
                                },60);
                            })
                            data.disc = undefined;
                            world.setDynamicProperty(`car:${target.id}`, JSON.stringify(data));
                            break;
                        }
                    }
                })
            })
        } else {
            if(!hasKey(player, target)){ return; }
            system.run(() => {
                new ActionFormData()
                    .title(`§rLemon ONE - Vehicle System operation`)
                    .button(`§rStart`, 'textures/items/car_on')
                    .show(player).then(res => {
                        if (res.canceled) return;

                        switch (res.selection) {
                            case 0: {
                                entityData.option = true;
                                target.triggerEvent("back_mirror_open");
                                target.triggerEvent(`speed0`);
                                saveData(target.id, entityData);

                                break;
                            }
                        }
                    })
            })
        }
    } else if (itemStack?.typeId == "key:dw_tosca_key" && itemStack?.getLore()[0]?.slice(14) == target.id) {
        e.cancel = true
        openui(player, entityData)
    }

    if (itemStack?.getLore()[0]?.slice(14) != target.id) {
        e.cancel = true
    }
})