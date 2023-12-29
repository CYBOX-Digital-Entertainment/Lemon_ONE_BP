export function playAni(player, eventName) {
    player.dimension.getEntities({
        type: "daewoo:tosca_gb",
        tags: [`id:${player.id}`] // 변경 된 코드에 따라 수정 예정
    }).forEach(f => {
        const rid = f.getComponent(`minecraft:rideable`);
        if (rid.getRiders()[0].id == player.id) {
            f.triggerEvent(eventName);
        }
    });
}
