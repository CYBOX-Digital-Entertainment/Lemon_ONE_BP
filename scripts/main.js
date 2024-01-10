import { world, ItemStack, system } from "@minecraft/server";
import "./interact";
import { readData, saveData } from "./db";
import { EntityData } from "./class";
import { tpTr } from "./function";
//자동차 스폰시 기본 설정
world.afterEvents.entitySpawn.subscribe(({ entity }) => {
    if (readData(entity.id) == undefined && entity.typeId == "daewoo:tosca_gb") {
        const dimension = entity.dimension;
        const tr = entity.dimension.spawnEntity(`addon:tr`, entity.location);
        const itemStack = new ItemStack(`key:key`, 1);
        itemStack.setLore([`등록된 자동차 아이디 : ${entity.id}`]);
        entity.dimension.spawnItem(itemStack, entity.location);
        const data = new EntityData();
        data.setTrId(tr.id);
        data.setEntId(entity.id);
        saveData(entity.id, data);
        world.sendMessage(JSON.stringify(data));
    }
});
//렉 방지를 위해 10틱(0.5초)마다 반복
system.runInterval(() => {
    world.getDimension(`overworld`).getEntities({
        type: "daewoo:tosca_gb"
    }).forEach(f => {
        const data = readData(f.id);
        tpTr(data);
    });
    world.getDimension(`the_end`).getEntities({
        type: "daewoo:tosca_gb"
    }).forEach(f => {
        const data = readData(f.id);
        tpTr(data);
    });
    world.getDimension(`nether`).getEntities({
        type: "daewoo:tosca_gb"
    }).forEach(f => {
        const data = readData(f.id);
        tpTr(data);
    });
}, 10);
