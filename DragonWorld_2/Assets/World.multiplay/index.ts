import {Sandbox, SandboxOptions, SandboxPlayer} from "ZEPETO.Multiplay";
import {Player, sVector3, sQuaternion, SyncTransform, PlayerAdditionalValue, ZepetoAnimationParam} from "ZEPETO.Multiplay.Schema";
import { HttpContentType, HttpService } from 'ZEPETO.Multiplay.HttpService';
// import { DataStorage } from "ZEPETO.Multiplay.DataStorage";

export default class extends Sandbox {
    private sessionIdQueue: string[] = [];
    private InstantiateObjCaches : InstantiateObj[] = [];
    private masterClient = () => this.loadPlayer(this.sessionIdQueue[0]);

    // storageMap:Map<string,DataStorage> = new Map<string, DataStorage>();

    onCreate(options: SandboxOptions) {
        /**Zepeto Player Sync**/
        this.onMessage(MESSAGE.SyncPlayer, (client, message) => {
            const player = this.state.players.get(client.sessionId);
            /** State **/
            //animation param
            const animationParam = new ZepetoAnimationParam();
            animationParam.State = message.animationParam.State;
            animationParam.MoveState = message.animationParam.MoveState;
            animationParam.JumpState = message.animationParam.JumpState;
            animationParam.LandingState = message.animationParam.LandingState;
            animationParam.MotionSpeed = message.animationParam.MotionSpeed;
            animationParam.FallSpeed = message.animationParam.FallSpeed;
            animationParam.Acceleration = message.animationParam.Acceleration;
            animationParam.MoveProgress = message.animationParam.MoveProgress;
            player.animationParam = animationParam;

            player.gestureName = message.gestureName; // Gesture Sync

            //additional Value
            if(message.playerAdditionalValue != null) {
                const pAdditionalValue = new PlayerAdditionalValue();
                pAdditionalValue.additionalWalkSpeed = message.playerAdditionalValue.additionalWalkSpeed;
                pAdditionalValue.additionalRunSpeed = message.playerAdditionalValue.additionalRunSpeed;
                pAdditionalValue.additionalJumpPower = message.playerAdditionalValue.additionalJumpPower;
                player.playerAdditionalValue = pAdditionalValue;
            }
        });

        /**Transform Sync**/
        this.onMessage(MESSAGE.SyncTransform, (client, message) => {
            if (!this.state.SyncTransforms.has(message.Id)) {
                const syncTransform = new SyncTransform();
                this.state.SyncTransforms.set(message.Id.toString(), syncTransform);
            }
            const syncTransform:SyncTransform = this.state.SyncTransforms.get(message.Id);
            syncTransform.Id = message.Id;
            syncTransform.position = new sVector3();
            syncTransform.position.x = message.position.x;
            syncTransform.position.y = message.position.y;
            syncTransform.position.z = message.position.z;

            syncTransform.localPosition = new sVector3();
            syncTransform.localPosition.x = message.localPosition.x;
            syncTransform.localPosition.y = message.localPosition.y;
            syncTransform.localPosition.z = message.localPosition.z;
            
            syncTransform.rotation = new sQuaternion();
            syncTransform.rotation.x = message.rotation.x;
            syncTransform.rotation.y = message.rotation.y;
            syncTransform.rotation.z = message.rotation.z;
            syncTransform.rotation.w = message.rotation.w;
            
            syncTransform.scale = new sVector3();
            syncTransform.scale.x = message.scale.x;
            syncTransform.scale.y = message.scale.y;
            syncTransform.scale.z = message.scale.z;
            
            syncTransform.sendTime = message.sendTime;
        });
        this.onMessage(MESSAGE.SyncTransformStatus, (client, message) => {
            const syncTransform:SyncTransform = this.state.SyncTransforms.get(message.Id);
            syncTransform.status = message.Status;
        });

        this.onMessage(MESSAGE.ChangeOwner, (client,message:string) => {
            this.broadcast(MESSAGE.ChangeOwner+message, client.sessionId);
        });
        this.onMessage(MESSAGE.Instantiate, (client,message:InstantiateObj) => {
            const InstantiateObj: InstantiateObj = {
                Id: message.Id,
                prefabName: message.prefabName,
                ownerSessionId: message.ownerSessionId,
                spawnPosition: message.spawnPosition,
                spawnRotation: message.spawnRotation,
            };
            this.InstantiateObjCaches.push(InstantiateObj);
            this.broadcast(MESSAGE.Instantiate, InstantiateObj);
        });
        this.onMessage(MESSAGE.RequestInstantiateCache, (client) => {
            this.InstantiateObjCaches.forEach((obj)=>{
                client.send(MESSAGE.Instantiate, obj);
            });
        });

        /**SyncDOTween**/
        this.onMessage(MESSAGE.SyncDOTween, (client, message: syncTween) => {
            const tween: syncTween = {
                Id: message.Id,
                position: message.position,
                nextIndex: message.nextIndex,
                loopCount: message.loopCount,
                sendTime: message.sendTime,
            };
            this.broadcast(MESSAGE.ResponsePosition + message.Id, tween, {except: this.masterClient()});
        });

        /**Common**/
        this.onMessage(MESSAGE.CheckServerTimeRequest, (client, message) => {
            let Timestamp = +new Date();
            client.send(MESSAGE.CheckServerTimeResponse, Timestamp);
        });
        this.onMessage(MESSAGE.CheckMaster, (client, message) => {
            console.log(`master->, ${this.sessionIdQueue[0]}`);
            this.broadcast(MESSAGE.MasterResponse, this.sessionIdQueue[0]);
        });

        // // param sync
        // this.onMessage(MESSAGE.SyncPlayerAge, (client, message) => {
        //     const player = this.state.players.get(client.sessionId);
        //     console.log(`SyncPlayerAge->, ${player.age}`);
        //     this.broadcast(MESSAGE.SyncPlayerAge, player.age);
        // });
        
        this.onMessage(MESSAGE.PauseUser, (client) => {
            if(this.sessionIdQueue.includes(client.sessionId)) {
                const pausePlayerIndex = this.sessionIdQueue.indexOf(client.sessionId);
                this.sessionIdQueue.splice(pausePlayerIndex, 1);
                
                if (pausePlayerIndex == 0) {
                    console.log(`master->, ${this.sessionIdQueue[0]}`);
                    this.broadcast(MESSAGE.MasterResponse, this.sessionIdQueue[0]);
                }
            }
        });
        this.onMessage(MESSAGE.UnPauseUser, (client) => {
            if(!this.sessionIdQueue.includes(client.sessionId)) {
                this.sessionIdQueue.push(client.sessionId);
                this.broadcast(MESSAGE.MasterResponse, this.sessionIdQueue[0]);
            }
        });
        
        // // 서버 시간(태양 위치) 동기화
        // this.onMessage(MESSAGE.ServerTime, async (client, time) => {
        //     this.broadcast(MESSAGE.ServerTime, time);
        //     const response = await HttpService.postAsync("https://metasuite.co.kr/00php/test/testPOST4.php", { "user_name": client.userId }, HttpContentType.ApplicationUrlEncoded);
        //     console.log(response.response);
        //     const json = JSON.parse(response.response);
        //     console.log(json);
        // });


        // // 레벨 / 경험치 저장
        // this.onMessage("Exp", (client,exp) => {
        //     const player = this.state.players.get(client.sessionId);
        //     player.exp = exp;
        // });

        // TrackData Send
        this.onMessage("TrackData", async (client,message) => {
            console.log("TrackData send : " + message.TrackData);
            const response = await HttpService.postAsync("https://metawill.shop/zepeto/in_moving_data.php", message.TrackData, HttpContentType.ApplicationUrlEncoded);
            console.log("TrackData response : " + response.response);
        });
        
        /** Sample Code **/
        this.onMessage(MESSAGE.BlockEnter, (client,transformId:string) => {
            this.broadcast(MESSAGE.BlockEnter+transformId, client.sessionId);
        });
        this.onMessage(MESSAGE.BlockExit, (client,transformId:string) => {
            this.broadcast(MESSAGE.BlockExit+transformId, client.sessionId);
        });
        this.onMessage(MESSAGE.SendBlockEnterCache, (client,blockCache) => {
            this.loadPlayer(blockCache.newJoinSessionId)?.send(MESSAGE.BlockEnter+blockCache.transformId, client.sessionId);
        });
        
        this.onMessage(MESSAGE.CoinAcquired, (client,transformId:string) => {
            this.masterClient()?.send(MESSAGE.CoinAcquired+transformId, client.sessionId);
        });
        
        /** Racing Game **/
        let isStartGame:boolean = false;
        let startServerTime:number;
        this.onMessage(MESSAGE.StartRunningRequest, (client) => {
            if(!isStartGame) {
                isStartGame = true;
                startServerTime = +new Date();

                this.broadcast(MESSAGE.CountDownStart, startServerTime);
            }
        });
        this.onMessage(MESSAGE.FinishPlayer, (client,finishTime:number) => {
            let playerLapTime = (finishTime-startServerTime)/1000;
            console.log(`${client.sessionId}is enter! ${playerLapTime}`);
            const gameReport: GameReport = {
                playerUserId: client.userId,
                playerLapTime: playerLapTime,
            };
            this.broadcast(MESSAGE.ResponseGameReport, gameReport);
            if(isStartGame) {
                isStartGame = false;
                let gameEndTime:number = +new Date();
                this.broadcast(MESSAGE.FirstPlayerGetIn, gameEndTime);
            }
        });
    }
    async onJoin(client: SandboxPlayer) {
        const player = new Player();
        player.sessionId = client.sessionId;
        if (client.hashCode) {
            player.zepetoHash = client.hashCode;
        }
        if (client.userId) {
            player.zepetoUserId = client.userId;
        }
        // try {
        //     const response = await HttpService.postAsync("https://metasuite.co.kr/00php/test/testPOST3.php", { "user_name": client.userId, "user_age": Math.floor(Math.random()*100) }, HttpContentType.ApplicationUrlEncoded);
        //     console.log("postAsync - https://metasuite.co.kr/00php/test/testPOST3.php\n" + response.response);
        //     const json = JSON.parse(response.response);
        //     console.log(json);
        //     player.age = json.user_age;
        // } catch (error) {
        //     console.error(error);
        // }

        // [DataStorage] 입장한 Player의 DataStorage Load
        // const storage: DataStorage = client.loadDataStorage();

        // this.storageMap.set(client.sessionId,storage);

        // // let visit_cnt = await storage.get("VisitCount") as number;
        // // if (visit_cnt == null) visit_cnt = 0;
        
        // let exp = await storage.get("exp") as number;
        // if (exp == null) player.exp = 0;
        // else player.exp = exp;
        

        // console.log(`[OnJoin] ${client.sessionId}'s visiting count : ${visit_cnt} // PopState : ${popState}, PopState : ${player.popState}`)

        // [DataStorage] Player의 방문 횟수를 갱신한다음 Storage Save
        // await storage.set("VisitCount", ++visit_cnt);

        const players = this.state.players;
        players.set(client.sessionId, player);
        if(!this.sessionIdQueue.includes(client.sessionId)) {
            this.sessionIdQueue.push(client.sessionId.toString());
        }
        console.log(`[onJoin] join player, ${client.sessionId}`);
        // console.log(`[onJoin] join player, ${client.sessionId}, ${players.get(client.sessionId).age}`);
        // console.log(`[onJoin] join player, ${client.sessionId}, ${players.get(client.sessionId).age}, ${players.get(client.sessionId).exp}`);
        

        // *데이터 저장 및 수정
        // URL : https://metasuite.co.kr/00php/test/testPOST3.php
        // Key1 = user_name
        // Key2 = user_age

        // *데이터 불러오기
        // URL : https://metasuite.co.kr/00php/test/testPOST4.php
        // Key1 = user_name
    }

    async onLeave(client: SandboxPlayer, consented?: boolean) {
        console.log(`[onLeave] leave player, ${client.sessionId}`);
        // const player = this.state.players.get(client.sessionId);
        // const storage: DataStorage = client.loadDataStorage();
        // await storage.set("exp", player.exp);

        this.state.players.delete(client.sessionId);
        if(this.sessionIdQueue.includes(client.sessionId)) {
            const leavePlayerIndex = this.sessionIdQueue.indexOf(client.sessionId);
            this.sessionIdQueue.splice(leavePlayerIndex, 1);
            if (leavePlayerIndex == 0) {
                console.log(`master->, ${this.sessionIdQueue[0]}`);
                this.broadcast(MESSAGE.MasterResponse, this.sessionIdQueue[0]);
            }
        }
    }
}

interface syncTween {
    Id: string,
    position: sVector3,
    nextIndex: number,
    loopCount: number,
    sendTime: number,
}

interface InstantiateObj{
    Id:string;
    prefabName:string;
    ownerSessionId?:string;
    spawnPosition?:sVector3;
    spawnRotation?:sQuaternion;
}

/** racing game **/
interface GameReport{
    playerUserId : string;
    playerLapTime : number;
}

enum MESSAGE {
    SyncPlayer = "SyncPlayer",
    SyncPlayerAge = "SyncPlayerAge",
    SyncTransform = "SyncTransform",
    SyncTransformStatus = "SyncTransformStatus",
    ChangeOwner = "ChangeOwner",
    Instantiate = "Instantiate",
    RequestInstantiateCache = "RequestInstantiateCache",
    ResponsePosition = "ResponsePosition",
    SyncDOTween = "SyncDOTween",
    CheckServerTimeRequest = "CheckServerTimeRequest",
    CheckServerTimeResponse = "CheckServerTimeResponse",
    CheckMaster = "CheckMaster",
    MasterResponse = "MasterResponse",
    PauseUser = "PauseUser",
    UnPauseUser = "UnPauseUser",

    /** Sample Code **/
    BlockEnter = "BlockEnter",
    BlockExit = "BlockExit",
    SendBlockEnterCache = "SendBlockEnterCache",
    CoinAcquired = "CoinAcquired",

    /** Racing Game **/
    StartRunningRequest = "StartRunningRequest",
    FinishPlayer = "FinishPlayer",
    FirstPlayerGetIn = "FirstPlayerGetIn",
    CountDownStart = "CountDownStart",
    ResponseGameReport = "ResponseGameReport",

    /** server time **/
    ServerTime = "ServerTime"
}

