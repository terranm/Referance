declare module "ZEPETO.Multiplay.Schema" {

	import { Schema, MapSchema, ArraySchema } from "@colyseus/schema"; 


	interface State extends Schema {
		players: MapSchema<Player>;
		bus: MapSchema<Bus>;
	}
	class Player extends Schema {
		sessionId: string;
		zepetoHash: string;
		zepetoUserId: string;
		transform: Transform;
		state: number;
		isRide: boolean;
		busTransform: Transform;
		King: boolean;
		busIndex: number;
	}
	class Transform extends Schema {
		position: vector3;
		rotation: vector3;
	}
	class vector3 extends Schema {
		x: number;
		y: number;
		z: number;
	}
	class Bus extends Schema {
		x: Transform;
		index: number;
	}
}