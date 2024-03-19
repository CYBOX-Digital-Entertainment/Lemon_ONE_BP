import { EntityInventoryComponent, ItemStack, system, world } from "@minecraft/server";
import "./interact";
import { readData, saveData } from "./db";
import { EntityData } from "./class";
import { getRidingEntity, loop } from "./function";
import { carNameList, carInfoObj } from "./settings";
let waitingItemStack;
const initialItems = [
    "cybox:tosca_paint_ddg",
    "cybox:tosca_paint_gb",
    "cybox:tosca_paint_gw",
    "cybox:tosca_paint_kr",
    "cybox:tosca_paint_og",
    "cybox:tosca_paint_pb",
    "cybox:tosca_paint_ps",
    "cybox:tosca_paint_sdg",
    "cybox:tosca_paint_wp",
    "cybox:tosca_police_kit",
];
world.afterEvents.itemUseOn.subscribe(({ source, itemStack }) => {
    if (itemStack.typeId === "cybox:dw_tosca_spawn_egg") {
        source.getComponent(EntityInventoryComponent.componentId)
            ?.container
            ?.addItem(waitingItemStack);
    }
});
//차량 엔티티가 파괴될 때 트렁크 삭제 및 데이터 삭제
world.afterEvents.entityDie.subscribe(res => {
    const entity = res.deadEntity;
    if (carNameList().includes(entity.typeId)) {
        const data = readData(entity.id);
        const tr = world.getEntity(data.trid);
        tr?.teleport(entity.location);
        tr?.kill();
        saveData(entity.id, undefined);
        saveData(`car:${entity.id}`, undefined);
    }
});
//자동차 스폰시 기본 설정
world.afterEvents.entitySpawn.subscribe(({ entity }) => {
    if (readData(entity.id) === undefined && carNameList().includes(entity.typeId)) {
        const carInfo = carInfoObj[entity.typeId];
        const tr = entity.dimension.spawnEntity(`addon:tr`, entity.location);
        const truncInvComponent = tr.getComponent(EntityInventoryComponent.componentId);
        initialItems.forEach(initialItem => truncInvComponent?.container?.addItem(new ItemStack(initialItem, 3)));
        entity.triggerEvent('speed0');
        entity.triggerEvent('neutral_off');
        const data = new EntityData();
        data.setTrId(tr.id);
        data.setEntId(entity.id);
        saveData(entity.id, data);
        waitingItemStack = new ItemStack(carInfo.key, 1);
        waitingItemStack.setLore([`등록된 자동차 아이디 : ${entity.id}`]);
        truncInvComponent?.container?.setItem(13, waitingItemStack);
        world.setDynamicProperty(`car:${entity.id}`, JSON.stringify({
            headLight: false, // 헤드라이트
            left_signal: false, // 좌 신호등
            right_signal: false, // 우 신호등
            window: true, //창문
            speed: 30,
            siren: false,
            mode: 0
        }));
    }
});
const worlds = [world.getDimension(`overworld`), world.getDimension(`the_end`), world.getDimension(`nether`)];
let rider = [];
system.runInterval(() => {
    const list = [];
    worlds.forEach(dimension => {
        dimension.getEntities().filter(x => carNameList().includes(x.typeId)).forEach(f => {
            loop(f);
            f.getComponent('rideable')?.getRiders().forEach(x => {
                if (list.includes(x.id) == false)
                    list.push(x.id);
            });
        });
    });
    rider.filter(x => list.includes(x) == false).forEach(x => {
        stopSound(x);
        system.runTimeout(() => {
            stopSound(x);
        }, 60);
    });
    rider = list;
    // ["overworld", "the_end", "nether"].forEach(dimension => {
    //     const solidExist = (id: string) => world.getDimension(dimension).getEntities({ type: "cybox:dw_tosca" }).filter(x => x.id === id).length !== 0;
    //     world.getDimension(dimension).getEntities({ type: "cybox:dw_tosca_solid" }).forEach(x => {
    //         if(!solidExist(x.nameTag.split(":")[1])){
    //             x.remove()
    //         }
    //     })
    // })
    world.getAllPlayers().forEach(player => {
        if (carNameList().includes(getRidingEntity(player)?.typeId)) {
            if (!player.hasTag('unhittable')) {
                player.addTag('unhittable');
            }
        }
        else {
            if (player.hasTag('unhittable')) {
                player.removeTag('unhittable');
            }
        }
    });
});
const discList = [
    '13',
    '11',
    '5',
    'blocks',
    'cat',
    'chirp',
    'far',
    'mall',
    'otherside',
    'pigstep',
    'relic',
    'stal',
    'strad',
    'wait',
    'ward'
];
export function stopSound(id) {
    const target = world.getEntity(id);
    if (target == undefined)
        return;
    discList.forEach(x => {
        target.runCommandAsync(`stopsound @s record.${x}`);
    });
}
