import { system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { UIViewer } from "./DataBase";
//주면에 플래이어가 있으면 ui띄움
export function openui(entity) {
    system.run(() => {
        let ui = new ActionFormData().body(``).button(`운전자 탑승`).button(`트렁크 열기`).button(`트렁크 닫기`);
        entity.forEach(entity => {
            if (entity.getTags().find(f => f.startsWith("id:"))?.slice(3) === undefined)
                return;
            if (entity.hasTag(`탑승`))
                return;
            let ent = entity.dimension.getEntities({
                location: entity.location,
                maxDistance: 3,
                type: "minecraft:player",
                tags: [`id:${entity.id}`]
            });
            if (ent === undefined)
                return;
            ent.forEach(pl => {
                if (UIViewer[pl.id] === "closeui" || UIViewer[pl.id] === undefined) {
                    system.runTimeout(() => {
                        ui.show(pl).then(t => {
                            UIViewer[pl.id] = "closeui";
                            console.warn(t.selection);
                            switch (t.selection) {
                                case 0: {
                                    ride(pl, entity);
                                    break;
                                }
                                case 1: {
                                    open();
                                    break;
                                }
                                case 2: {
                                    close();
                                    break;
                                }
                                default:
                                    break;
                            }
                        });
                    }, 20);
                    UIViewer[pl.id] = "openui";
                }
                else
                    return;
            });
        });
    });
}
function close() {
    if (world.getDimension(`overworld`).getEntities({ type: "bat" }) ?? "" == "") {
        console.warn(`닫기`);
    }
    for (const entity of world.getDimension(`overworld`).getEntities().filter(f => f.typeId == "addon:tr")) {
        if (entity.getTags().find(f => f.startsWith(`id:`)) == undefined)
            continue;
        let ent2 = world.getEntity(entity.getTags().find(f => f.startsWith(`id:`))?.slice(3) ?? "")?.id;
        if ("id:" + ent2 == entity.getTags().find(f => f.startsWith(`id:`))) {
            console.warn(entity.id);
            entity.removeTag(entity.getTags().find(f => f.startsWith(`trunk`)) ?? "");
            entity.addTag(`trunkclose`);
        }
        ;
    }
}
function open() {
    if (world.getDimension(`overworld`).getEntities({ type: "bat" }) ?? "" == "") {
        console.warn(`열기`);
    }
    for (const entity of world.getDimension(`overworld`).getEntities().filter(f => f.typeId == "addon:tr")) {
        if (entity.getTags().find(f => f.startsWith(`id:`)) == undefined)
            continue;
        let ent2 = world.getEntity(entity.getTags().find(f => f.startsWith(`id:`))?.slice(3) ?? "")?.id;
        if ("id:" + ent2 == entity.getTags().find(f => f.startsWith(`id:`))) {
            console.warn(entity.id);
            entity.removeTag(entity.getTags().find(f => f.startsWith(`trunk`)) ?? "");
            entity.addTag(`trunkopen`);
        }
        ;
    }
}
function ride(player, ent) {
    ent.playAnimation(`animation.tosca.right_front_door_open`);
    ent.addTag(`탑승`);
    player.sendMessage(`자동차에 탑승하며 주십시오.`);
}
