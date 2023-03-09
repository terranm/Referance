import {ZepetoScriptBehaviour} from 'ZEPETO.Script'
import {ZepetoWorldMultiplay} from 'ZEPETO.World'
import {Room, RoomData} from 'ZEPETO.Multiplay'
import {Car, Player, State, Vector3} from 'ZEPETO.Multiplay.Schema'
import {CharacterState, SpawnInfo, ZepetoPlayers, ZepetoPlayer, UIZepetoPlayerControl} from 'ZEPETO.Character.Controller'
import * as UnityEngine from "UnityEngine";
import GameManager from './GameManager'
import PlayerCtrl from './PlayerCtrl'
import { ZepetoInputControl } from 'RootNamespace'
import { UnityEvent$1 } from 'UnityEngine.Events'
import { LightProbeUsage } from 'UnityEngine.Rendering'
import CameraClamp from './CameraClamp'
import { AnalyticsType, ZepetoAnalyticsComponent } from 'ZEPETO.Analytics'


interface MessageModel {
    sessionId: string,
    name: string,
    state: boolean
    
 }

export default class Starter extends ZepetoScriptBehaviour {

    public multiplay: ZepetoWorldMultiplay;
    public spawnPoint: UnityEngine.Transform;
    private room: Room;
    public get Room(): Room { return this.room;}
    private plyer:Player;
    private state:State;
    private currentPlayers: Map<string, Player> = new Map<string, Player>();
    private currentCars:Map<string, Car> = new Map<string, Car>();
    private carMap:Map<string, UnityEngine.GameObject> = new Map<string, UnityEngine.GameObject>();
    public startLoadingImg:UnityEngine.GameObject;
    // private analytics : ZepetoAnalyticsComponent;
    
    //public playerObj:UnityEngine.GameObject;

    private Start() {
        this.StartCoroutine(this.LoadingImg());
        this.multiplay.RoomCreated += (room: Room) => {
            this.room = room;
        };

        this.multiplay.RoomJoined += (room: Room) => {
            room.OnStateChange += this.OnStateChange;
            
            room.AddMessageHandler<MessageModel>("Wear",(message:MessageModel)=>{
                
                const player = this.currentPlayers.get(message.sessionId);
                
                if(message.name == "glasses" && message.state == true){
                    GameManager.GetInstance.WearGlasses(message.sessionId);
                }
                else if(message.name == "glasses" && message.state == false){
                    GameManager.GetInstance.TurnOffObj("glasses", message.sessionId);
                }
                else if(message.name == "balloon" && message.state == true){
                    GameManager.GetInstance.WearBalloon(message.sessionId);
                }
                else if(message.name == "balloon" && message.state == false){
                    GameManager.GetInstance.TurnOffObj("balloon", message.sessionId);
                }
                else if(message.name == "wing" && message.state == true){
                    GameManager.GetInstance.WearWing(message.sessionId);
                }
                else if(message.name == "wing" && message.state == false){
                    GameManager.GetInstance.TurnOffObj("wing", message.sessionId);
                }
            })
        };
        
        this.StartCoroutine(this.SendMessageLoop(0.1));

        // this.analytics = UnityEngine.GameObject.Find("ZepetoAnalytics").GetComponent<ZepetoAnalyticsComponent>();
        // console.log(this.analytics.name);
    }

    // 일정 Interval Time으로 내(local)캐릭터 transform을 server로 전송합니다.
    private* SendMessageLoop(tick: number) {
        while (true) {
            yield new UnityEngine.WaitForSeconds(tick);

            if (this.room != null && this.room.IsConnected) {
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.room.SessionId);
                if (hasPlayer) {
                    const myPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
                    //if (myPlayer.character.CurrentState != CharacterState.Idle)
                        this.SendTransform(myPlayer.character.transform);
                }
            }
        }
    }

    private OnStateChange(state: State, isFirst: boolean) {
        this.state = state;
        // 첫 OnStateChange 이벤트 수신 시, State 전체 스냅샷을 수신합니다.
        if (isFirst) {

            // [CharacterController] (Local)Player 인스턴스가 Scene에 완전히 로드되었을 때 호출
            ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
                
                const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
                myPlayer.character.gameObject.tag = "Player";
                let zepetoCameraClamp = ZepetoPlayers.instance.ZepetoCamera.cameraParent.gameObject.AddComponent<CameraClamp>();
                zepetoCameraClamp.Init(-40, 70, ZepetoPlayers.instance.ZepetoCamera.Speed);
                let lightProb = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.GetComponentsInChildren<UnityEngine.SkinnedMeshRenderer>();
                lightProb.forEach((value, index)=>{
                    value.lightProbeUsage = LightProbeUsage.BlendProbes;
                });
                GameManager.UI.ShowUI(this.plyer.quest.toString(), 1);
                //this.playerObj.transform.SetParent(myPlayer.character.gameObject.transform);
                
                myPlayer.character.OnChangedState.AddListener((cur, next) => {
                    this.SendState(next);
                });
                // // 제페토 analytics - 캐릭터 접속 신호 전송 코드
                // const param = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.userId;
        
                // const google = this.analytics.Analytics(AnalyticsType.GoogleAnalytics);
                // interface CustomEvent
                // {
                //     param1 : string;
                // }
                // const eventParams:CustomEvent = {
                //     param1 : param
                // };
                // google.LogEvent<CustomEvent>("TAMSZERO", eventParams); 
                // console.log(eventParams.param1,"google.LogEvent<CustomEvent>(\"TAMSZERO\", eventParams)");
            });

            // [CharacterController] Player 인스턴스가 Scene에 완전히 로드되었을 때 호출
            ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
                const isLocal = this.room.SessionId === sessionId;
                if (!isLocal) {
                    const player: Player = this.currentPlayers.get(sessionId);
                    const otherplayer = ZepetoPlayers.instance.GetPlayer(sessionId);
                    //otherplayer.character
                    let lightProb = otherplayer.character.GetComponentsInChildren<UnityEngine.SkinnedMeshRenderer>();
                    lightProb.forEach((value, index)=>{
                        value.lightProbeUsage = LightProbeUsage.BlendProbes;
                    });
                    if(player.glasses == true){
                        GameManager.GetInstance.WearGlasses(sessionId);
                    }
                    else if(player.balloon == true){
                        GameManager.GetInstance.WearBalloon(sessionId);
                    }
                    else if(player.wing == true){
                        GameManager.GetInstance.WearWing(sessionId);
                    }
                    // [RoomState] player 인스턴스의 state가 갱신될 때마다 호출됩니다.
                    player.OnChange += (changeValues) => this.OnUpdatePlayer(sessionId, player);
                    
                }
            });
        }

        let join = new Map<string, Player>();
        let leave = new Map<string, Player>(this.currentPlayers);
        let leaveCar = new Map<string, Car>(this.currentCars);

        state.players.ForEach((sessionId: string, player: Player) => {
            if (!this.currentPlayers.has(sessionId)) {
                join.set(sessionId, player);
                console.log("player create " + sessionId + " join " + join.size);
            }
            leave.delete(sessionId);
        });

        state.cars.ForEach((sessionId:string, car:Car)=>{
            if (this.currentPlayers.has(sessionId)){ // 차량 탑승 중에 나가면, 아래 조건들이 만족되어 차량이 생성됨. 캐릭터가 존재하는지에 대한 확인 후 생성해야함
                if (!this.currentCars.has(sessionId)) {
                    if(sessionId != this.room.SessionId)
                    {
                        this.currentCars.set(sessionId, car);
                        let _position = this.ParseVector3(car.transform.position);
                        let _rotation = this.ParseVector3(car.transform.rotation);
                    
                        let _car = GameManager.Resource().Instantiate("CarMulti");
                        console.log("CarMulti" + sessionId);
                        this.carMap.set(sessionId, _car);

                        _car.transform.position = _position;
                        _car.transform.rotation = UnityEngine.Quaternion.Euler(_rotation);
                        
                    
                        
                        const carObj:Car = this.currentCars.get(sessionId);
                        carObj.OnChange += (changeValues) => this.OnUpdateCar(sessionId, carObj);
                    }
                }
                leaveCar.delete(sessionId);
            }
        })


        // [RoomState] Room에 입장한 player 인스턴스 생성
        join.forEach((player: Player, sessionId: string) => this.OnJoinPlayer(sessionId, player));

        // [RoomState] Room에서 퇴장한 player 인스턴스 제거
        leaveCar.forEach((car:Car, sessionId: string) => this.OnLeaveCar(sessionId, car));
        leave.forEach((player: Player, sessionId: string) => this.OnLeavePlayer(sessionId, player));
        
    }

    private OnJoinPlayer(sessionId: string, player: Player) {
        console.log(`[OnJoinPlayer] players - sessionId : ${sessionId}`);
        this.currentPlayers.set(sessionId, player);

        const spawnInfo = new SpawnInfo();
        const position = this.spawnPoint.transform.position;
        const rotation = this.spawnPoint.transform.rotation;
        // const position = UnityEngine.Vector3.zero;
        // const rotation = UnityEngine.Quaternion.identity;
        spawnInfo.position = position;
        spawnInfo.rotation = rotation;
        const isLocal = this.room.SessionId === player.sessionId;
        if(isLocal){
            this.plyer = player;
            GameManager.player = player;
        }
        ZepetoPlayers.instance.CreatePlayerWithUserId(sessionId, player.zepetoUserId, spawnInfo, isLocal);
    }

    private OnLeavePlayer(sessionId: string, player: Player) {
        console.log(`[OnRemove] players - sessionId : ${sessionId}`);
        // let car =  this.carMap.get(sessionId);
        // let carCom = car.GetComponent<Car>();
        this.OnLeaveCar(sessionId)
        this.currentPlayers.delete(sessionId);
        //this.currentCars.delete(sessionId);
        //GameManager.Resource().Destroy(car);
        //this.carMap.delete(sessionId);
        console.log("car del " + sessionId);
        GameManager.GetInstance.LeavePlayer(sessionId);
        ZepetoPlayers.instance.RemovePlayer(sessionId);
    }

    private OnLeaveCar(sessionId: string, car:Car = null) {
        console.log(`[OnRemove] car - sessionId : ${sessionId}`);
        this.currentCars.delete(sessionId);
        let _car = this.carMap.get(sessionId); 
        if(_car != null)
            GameManager.Resource().Destroy(_car);
        this.carMap.delete(sessionId);
    }

    private OnUpdatePlayer(sessionId: string, player: Player) {
        
        const position = this.ParseVector3(player.transform.position);
        const rotation = this.ParseVector3(player.transform.rotation);
        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
        if(player.ride != true){
            zepetoPlayer.character.transform.SetParent(null);
            zepetoPlayer.character.characterController.enabled = true;  
            zepetoPlayer.character.ZepetoAnimator.SetBool("isDrive", false);
            let dist = UnityEngine.Vector3.Distance(position, zepetoPlayer.character.transform.position);
            if(dist >= 3){
                zepetoPlayer.character.transform.position = position;
                zepetoPlayer.character.transform.rotation = UnityEngine.Quaternion.Euler(rotation);
            }else{
                zepetoPlayer.character.MoveToPosition(position);
            }
        }
        else{
            const car = this.carMap.get(sessionId);
            if(car == null || car == undefined) return;
            //console.log(car);
            zepetoPlayer.character.transform.SetParent(car.transform);
            zepetoPlayer.character.characterController.enabled = false;

            zepetoPlayer.character.transform.localPosition = new UnityEngine.Vector3(-0.303, 0, 0.034);
            zepetoPlayer.character.transform.localRotation = UnityEngine.Quaternion.identity;
            zepetoPlayer.character.ZepetoAnimator.SetBool("isDrive", true);
        }

        // if(player.glasses == true){
        //     GameManager.GetInstance.WearGlasses(sessionId);
        // }
        // else if(player.balloon == true){
        //     GameManager.GetInstance.WearBalloon(sessionId);
        // }
        // else if(player.wing == true){
        //     GameManager.GetInstance.WearWing(sessionId);
        // }
        

        if (player.state === CharacterState.JumpIdle || player.state === CharacterState.JumpMove)
            zepetoPlayer.character.Jump();
    }

    private OnUpdateCar(sessionId:string, car:Car){
        
        const _car = this.carMap.get(sessionId);
        const _rb = this.ParseVector3(car.velocity);
        
        const _steer = this.ParseVector3(car.steer);
        let rb = _car.gameObject.GetComponent<UnityEngine.Rigidbody>();
        rb.velocity = _rb;
        _car.gameObject.transform.eulerAngles = UnityEngine.Vector3.Lerp(_car.transform.eulerAngles, _steer, 3 * UnityEngine.Time.deltaTime);
    }

    private SendTransform(transform: UnityEngine.Transform) {
        const data = new RoomData();

        const pos = new RoomData();
        pos.Add("x", transform.localPosition.x);
        pos.Add("y", transform.localPosition.y);
        pos.Add("z", transform.localPosition.z);
        data.Add("position", pos.GetObject());

        const rot = new RoomData();
        rot.Add("x", transform.localEulerAngles.x);
        rot.Add("y", transform.localEulerAngles.y);
        rot.Add("z", transform.localEulerAngles.z);
        data.Add("rotation", rot.GetObject());
        this.room.Send("onChangedTransform", data.GetObject());
    }

    private SendState(state: CharacterState) {
        const data = new RoomData();
        data.Add("state", state);
        this.room.Send("onChangedState", data.GetObject());
    }

    private ParseVector3(vector3: Vector3): UnityEngine.Vector3 {
        return new UnityEngine.Vector3
        (
            vector3.x,
            vector3.y,
            vector3.z
        );
    }

    *LoadingImg(){
        while (true){
            yield new UnityEngine.WaitForSeconds(3);
            if (this.room != null && this.room.IsConnected){
                if (ZepetoPlayers.instance.HasPlayer(this.room.SessionId)){
                    this.startLoadingImg.SetActive(false);
                    this.StopCoroutine(this.LoadingImg);
                }
            }
        }
    }
}