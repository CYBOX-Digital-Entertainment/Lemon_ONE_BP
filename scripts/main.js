import { EntityInventoryComponent, ItemStack, system, world } from "@minecraft/server";
import "./interact";
import { readData, saveData } from "./db";
import { EntityData } from "./class";
import { loop } from "./function";
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
    if (entity.typeId == "cybox:dw_tosca") {
        const data = readData(entity.id);
        world.getEntity(data.trid)?.kill();
        saveData(entity.id, undefined);
        saveData(`car:${entity.id}`, undefined);
    }
});
//자동차 스폰시 기본 설정
world.afterEvents.entitySpawn.subscribe(({ entity }) => {
    if (readData(entity.id) === undefined && entity.typeId == "cybox:dw_tosca") {
        const tr = entity.dimension.spawnEntity(`addon:tr`, entity.location);
        const truncInvComponent = tr.getComponent(EntityInventoryComponent.componentId);
        initialItems.forEach(initialItem => truncInvComponent?.container?.addItem(new ItemStack(initialItem, 3)));
        const data = new EntityData();
        data.setTrId(tr.id);
        data.setEntId(entity.id);
        saveData(entity.id, data);
        waitingItemStack = new ItemStack("key:dw_tosca_key", 1);
        waitingItemStack.setLore([`등록된 자동차 아이디 : ${entity.id}`]);
        truncInvComponent?.container?.setItem(13, waitingItemStack);
        world.sendMessage(JSON.stringify(data));
    }
});
const overworld = world.getDimension(`overworld`);
const end = world.getDimension(`the_end`);
const nether = world.getDimension(`nether`);
//렉 방지를 위해 10틱(0.5초)마다 반복
system.runInterval(() => {
    overworld.getEntities({
        type: "cybox:dw_tosca"
    }).forEach(f => {
        loop(f);
    });
    end.getEntities({
        type: "cybox:dw_tosca"
    }).forEach(f => {
        loop(f);
    });
    nether.getEntities({
        type: "cybox:dw_tosca"
    }).forEach(f => {
        loop(f);
    });
}, 10);
