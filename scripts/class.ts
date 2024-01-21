import { Entity, world } from "@minecraft/server"

export class EntityData {
    constructor(data: EntityData | undefined = undefined) {
        this.entid = data?.entid ?? "";
        this.plid = data?.plid ?? "";
        this.trid = data?.trid ?? "";
        this.tropen = data?.tropen ?? false;
        this.ride = data?.ride ?? false;
    }

    plid: string
    tropen: boolean
    entid: string
    trid: string
    ride: boolean

    setPlid(id: string): EntityData {
        this.plid = id
        return this
    }
    setTrOpen(open: boolean): EntityData {
        this.tropen = open
        return this
    }
    setEntId(id: string): EntityData {
        this.entid = id
        return this
    }
    setTrId(id: string): EntityData {
        this.trid = id
        return this
    }
    setRide(ride: boolean): EntityData {
        this.ride = ride
        return this
    }
    entity():Entity | undefined {
        return world.getEntity(this.entid)
    }
}
