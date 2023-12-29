import { system, world, EntityRideableComponent, EntityInventoryComponent } from "@minecraft/server";
system.runInterval(()=>{
    world.getAllPlayers().forEach(player=>{
        const inv = player.getComponent(`minecraft:inventory`) as EntityInventoryComponent
        if (player.getTags().find(f=>f.startsWith(`id:`)) === undefined || world.getEntity(player.getTags().find(f=>f.startsWith(`id:`))?.slice(3) ?? "") === undefined) {
            for (let index = 0; index < 36; index++) {
                if (inv.container.getSlot(index).typeId?.startsWith(`addon:`)) {
                    inv.container.getSlot(index).setItem()
                }
            }
            return;
        }
        const entity = world.getEntity(player.getTags().find(f=>f.startsWith(`id:`))?.slice(3) ?? "")
        const rid = entity?.getComponent(`minecraft:rideable`) as EntityRideableComponent
        if (rid.getRiders()[0]?.id !== player.id) {
            for (let index = 0; index < 36; index++) {
                if (inv.container.getSlot(index).typeId?.startsWith(`addon:`)) {
                    inv.container.getSlot(index).setItem()
                }
            }
        }
        return;
    })
})