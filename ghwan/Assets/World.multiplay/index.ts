import {Sandbox, SandboxOptions, SandboxPlayer} from "ZEPETO.Multiplay";
import {DataStorage} from "ZEPETO.Multiplay.DataStorage";
import {Car, Player, Transform, Vector3} from "ZEPETO.Multiplay.Schema";

interface MessageModel {
    sessionId: string,
    name: string,
    state:boolean
 }

export default class extends Sandbox {


    storageMap:Map<string,DataStorage> = new Map<string, DataStorage>();
    
    constructor() {
        super();
    }

    onCreate(options: SandboxOptions) {

        // Room 객체가 생성될 때 호출됩니다.
        // Room 객체의 상태나 데이터 초기화를 처리 한다.

        this.onMessage("onChangedTransform", (client, message) => {
            console.log("onChangedTransform" + message);
            const player = this.state.players.get(client.sessionId);

            const transform = new Transform();
            transform.position = new Vector3();
            transform.position.x = message.position.x;
            transform.position.y = message.position.y;
            transform.position.z = message.position.z;

            transform.rotation = new Vector3();
            transform.rotation.x = message.rotation.x;
            transform.rotation.y = message.rotation.y;
            transform.rotation.z = message.rotation.z;

            player.transform = transform;
        });

        this.onMessage("onChangedVelocity", (client, message) => {
            const car = this.state.cars.get(client.sessionId);


            const transform = new Transform();
            let velocity = new Vector3();
            velocity.x = message.velocity.x;
            velocity.y = message.velocity.y;
            velocity.z = message.velocity.z;

            car.velocity = velocity;

            let steer = new Vector3();
            steer.x = message.steer.x;
            steer.y = message.steer.y;
            steer.z = message.steer.z;

            car.steer = steer;

            transform.position = new Vector3();
            transform.position.x = message.position.x;
            transform.position.y = message.position.y;
            transform.position.z = message.position.z;

            transform.rotation = new Vector3();
            transform.rotation.x = message.rotation.x;
            transform.rotation.y = message.rotation.y;
            transform.rotation.z = message.rotation.z;

            car.transform = transform;

            
        });

        this.onMessage("onChangedState", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            player.state = message.state;
            
            
        });


        this.onMessage("QuestUpdate", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            if(player.quest < message){
                player.quest = message
                console.log(player.quest);
            }
            if(player.quest == 6 || player.quest == 12 || player.quest == 18){
                client.send("QuestDelay", (++player.quest).toString());
            }
        });

        this.onMessage("Ride", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            player.ride = message;
            if(player.ride == true){
                let car = new Car();
                car.velocity = new Vector3();
                car.steer = new Vector3();

                const transform = new Transform();
                transform.position = new Vector3();
                transform.position.x = -26.662;
                transform.position.y = 55.58;
                transform.position.z = -114.5;
                transform.rotation = new Vector3();
                transform.rotation.x = 0;
                transform.rotation.y = 90;
                transform.rotation.z = 0;
                car.transform = transform;
                this.state.cars.set(client.sessionId, car);
            }
            else{
                this.state.cars.delete(client.sessionId);
            }
        });

        this.onMessage("Glasses", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            player.glasses = message;
            
            let _message = {sessionId:client.sessionId, name:"glasses", state: player.glasses} as MessageModel;
            this.broadcast("Wear", _message, { except: client });
            console.log(_message);
        });

        this.onMessage("Balloon", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            player.balloon = message;

            let _message = {sessionId:client.sessionId, name:"balloon", state: player.balloon} as MessageModel;
            this.broadcast("Wear", _message, { except: client });
            
        });

        this.onMessage("Wing", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            player.state = message.state;
            player.wing = message;

            let _message = {sessionId:client.sessionId, name:"wing", state:player.wing} as MessageModel;
            this.broadcast("Wear", _message, { except: client });

        });

        
    }
    
   
    
    async onJoin(client: SandboxPlayer) {

        // schemas.json 에서 정의한 player 객체를 생성 후 초기값 설정.
        console.log(`[OnJoin] sessionId : ${client.sessionId}, HashCode : ${client.hashCode}, userId : ${client.userId}`)

        const player = new Player();
        player.sessionId = client.sessionId;
        player.quest = 1;
        
        if (client.hashCode) {
            player.zepetoHash = client.hashCode;
        }
        if (client.userId) {
            player.zepetoUserId = client.userId;
        }

        // [DataStorage] 입장한 Player의 DataStorage Load
        const storage: DataStorage = client.loadDataStorage();

        this.storageMap.set(client.sessionId,storage);

        let visit_cnt = await storage.get("VisitCount") as number;
        if (visit_cnt == null) visit_cnt = 0;

        let questLevel = await storage.get("QusetLevel") as number;
        if (questLevel == null) player.quest = 1;
        else player.quest = questLevel;
        
        console.log(`[OnJoin] ${client.sessionId}'s visiting count : ${visit_cnt}`)

        // [DataStorage] Player의 방문 횟수를 갱신한다음 Storage Save
        await storage.set("VisitCount", ++visit_cnt);

        // client 객체의 고유 키값인 sessionId 를 사용해서 Player 객체를 관리.
        // set 으로 추가된 player 객체에 대한 정보를 클라이언트에서는 players 객체에 add_OnAdd 이벤트를 추가하여 확인 할 수 있음.
        this.state.players.set(client.sessionId, player);
        client.send("QuestInit", player.quest);
    }

    onTick(deltaTime: number): void {
        //  서버에서 설정된 타임마다 반복적으로 호출되며 deltaTime 을 이용하여 일정한 interval 이벤트를 관리할 수 있음.
    }

    async onLeave(client: SandboxPlayer, consented?: boolean) {
        const player = this.state.players.get(client.sessionId);
        const storage: DataStorage = client.loadDataStorage();
        await storage.set("QusetLevel", player.quest);
        
        // allowReconnection 설정을 통해 순단에 대한 connection 유지 처리등을 할 수 있으나 기본 가이드에서는 즉시 정리.
        // delete 된 player 객체에 대한 정보를 클라이언트에서는 players 객체에 add_OnRemove 이벤트를 추가하여 확인 할 수 있음.
        this.state.players.delete(client.sessionId);
    }
}