export function check_rider(entity) {
    entity.forEach(entity => {
        let rider = entity.getComponent(`minecraft:rideable`);
        if (entity.hasTag(`백미러`)) {
            entity.playAnimation(`animation.tosca.back_mirror_close`);
            entity.removeTag(`백미러`);
        }
        if (entity.dimension.getEntities({
            location: entity.location,
            maxDistance: 7,
            type: "minecraft:player",
            tags: [`id:${entity.id}`]
        }).length == 0) {
            entity.removeTag(`탑승`);
        }
        if (rider.getRiders().length === 0)
            return;
        if (rider.getRiders()[0].id !== entity.getTags().find(f => f.startsWith(`id:`))?.slice(3) || !entity.hasTag(`탑승`)) {
            rider.ejectRiders();
        }
    });
}
