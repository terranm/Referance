declare module "ZEPETO.Multiplay.Schema" {

	import { Schema, MapSchema, ArraySchema } from "@colyseus/schema"; 


	interface State extends Schema {
		players: MapSchema<Player>;
	}
	class Player extends Schema {
		sessionId: string;
		zepetoHash: string;
		zepetoUserId: string;
		transform: Transform;
		state: number;
		sit: boolean;
		curgesture: number;
		sit2: boolean;
	}
	class Transform extends Schema {
		position: Vector3;
		rotation: Vector3;
	}
	class Vector3 extends Schema {
		x: number;
		y: number;
		z: number;
	}
}