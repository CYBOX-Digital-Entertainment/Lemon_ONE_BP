export const carInfoObj = {
    "cybox:dw_tosca" : {
        spawnEgg : "cybox:dw_tosca_spawn_egg",
        key : "key:dw_tosca_key",
        esterEgg : "cybox:dw_tosca_core"
    },
    "cybox:sy_chairman" : {
        spawnEgg : "cybox:sy_chairman_spawn_egg",
        key : "key:sy_chairman_key",
        esterEgg : "cybox:sy_chairman_core"
    }
}

export const carNameList = () =>{
    return Object.keys(carInfoObj);
}