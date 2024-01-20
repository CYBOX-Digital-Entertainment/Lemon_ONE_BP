import { EntityRideableComponent, EntityInventoryComponent, system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { readData } from "./db";
import { openui, openui2, playAni, on_off } from "./function";
world.beforeEvents.playerInteractWithEntity.subscribe(e => {
    const { itemStack, player, target } = e;
    if (itemStack?.typeId == "minecraft:stick") {
        system.run(() => {
            console.warn(player.getComponent(EntityRideableComponent.componentId)?.addRider(target));
        });
    }
    if (target.typeId != "cybox:dw_tosca")
        return;
    const rid = target.getComponent(`minecraft:rideable`);
    const data = readData(target.id);
    if (itemStack?.typeId.startsWith(`addon:`) || (!data.ride && itemStack?.getLore()[0]?.slice(14) != target.id)) {
        e.cancel = true;
        console.warn(`cancel`);
        return;
    }
    if (itemStack?.typeId == "key:dw_tosca_key" && itemStack?.getLore()[0].slice(14) == target.id) {
        e.cancel = true;
        if (rid.getRiders()[0]?.id == player.id || rid.getRiders()[0]?.id == data.plid || data.ride) {
            //openui2(player, data);
            let entity = target;

            if(!world?.getDynamicProperty(`car:${entity.id}`))world.setDynamicProperty(`car:${entity.id}`, JSON.stringify({
                headLight: false,//헤드라이트
                left_signal: false,//좌 신호등
                right_signal: false,//우 신호등
                window: true,//창문
                speed: 30
            }));
            let speed = [30, 70, 100, 150, 220];
            let data = JSON.parse(world.getDynamicProperty(`car:${entity.id}`));//차 상태를 표시합니다.
            system.run(() => {
                function optionUi(){
                    new ActionFormData()
                    .title('차')
                    .button(`§r헤드라이트\n[ ${data.headLight?'§coff§r':'§aon§r'} ]`, `textures/items/headlight_${data.headLight?'off':'on'}`)//켜져있으면 [ off ], 꺼져있으면 [ on ]
                    .button(`§r좌측 신호등\n[ ${data.left_signal?'§coff§r':'§aon§r'} ]`, `textures/items/left_signal_${data.left_signal?'off':'on'}`)
                    .button(`§r우측 신호등\n[ ${data.right_signal?'§coff§r':'§aon§r'} ]`, `textures/items/right_signal_${data.right_signal?'off':'on'}`)
                    .button(`§r창문\n[ ${data.window?'§cclose§r':'§aopen§r'} ]`, `textures/items/roll_${data.window?'down':'up'}`)
                    .button(`§r속도 증가\n[ ${data.speed}${speed.indexOf(data.speed)==4?'':` -> §a${speed[speed.indexOf(data.speed)+1]}§r`} ]`, `textures/items/speed${speed.indexOf(data.speed)==4?'4':speed.indexOf(data.speed)+1}`)
                    .button(`§r속도 감소\n[ ${data.speed}${speed.indexOf(data.speed)==0?'':` -> §c${speed[speed.indexOf(data.speed)-1]}§r`} ]`, `textures/items/speed${speed.indexOf(data.speed)==0?'0':speed.indexOf(data.speed)-1}`)
                    .show(player).then(response => {
                        if(response.canceled)return;
                        
                        switch (response.selection){
                            case 0: {
                                if(data.headLight==true){
                                    playAni(player, "light_off");
                                    var test = data;test.headLight=false;world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(test))
                                }else{
                                    playAni(player, "light_on");
                                    var test = data;test.headLight=true;world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(test))
                                }
                                optionUi()
                                break;
                            }
                            case 1: {
                                if(data.left_signal==true){
                                    playAni(player, "left_signal_off");
                                    var test = data;test.left_signal=false;world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(test))
                                }else{
                                    playAni(player, "left_signal_on");
                                    var test = data;test.left_signal=true;world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(test))
                                }
                                optionUi()
                                break;
                            }
                            case 2: {
                                if(data.right_signal==true){
                                    playAni(player, "right_signal_off");
                                    var test = data;test.right_signal=false;world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(test))
                                }else{
                                    playAni(player, "right_signal_on");
                                    var test = data;test.right_signal=true;world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(test))
                                }
                                optionUi()
                                break;
                            }
                            case 3: {
                                if(data.window==true){
                                    var test = data;test.window=false;world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(test))
                                    playAni(player, "roll_down");
                                }else{
                                    var test = data;test.window=true;world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(test))
                                    playAni(player, "roll_up");
                                }
                                optionUi()
                                break;
                            }
                            case 4: {
                                if(speed.indexOf(data.speed)==4){
                                    player.sendMessage(`§4최대 속력입니다.`)
                                }else{
                                    playAni(player, `speed${speed.indexOf(data.speed)+1}`)
                                    var test = data;test.speed=speed[speed.indexOf(data.speed)+1];world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(test))
                                }
                                optionUi()
                                break;
                            }
                            case 5: {
                                if(speed.indexOf(data.speed)==0){
                                    player.sendMessage(`§4최소 속력입니다.`)
                                }else{
                                    playAni(player, `speed${speed.indexOf(data.speed)-1}`)
                                    var test = data;test.speed=speed[speed.indexOf(data.speed)-1];world.setDynamicProperty(`car:${entity.id}`, JSON.stringify(test))
                                }
                                optionUi()
                                break;
                            }
                        }
                    })
                }
                optionUi()
            })
        }
        else {
            openui(player, data);
        }
    }
});

//data: car:[id]
world.afterEvents.entitySpawn.subscribe(({ entity }) => {
    if (entity.typeId == "cybox:dw_tosca") {
        world.setDynamicProperty(`car:${entity.id}`, JSON.stringify({
            headLight: false,//헤드라이트
            left_signal: false,//좌 신호등
            right_signal: false,//우 신호등
            window: true,//창문
            speed: 30
        }))
    }
})