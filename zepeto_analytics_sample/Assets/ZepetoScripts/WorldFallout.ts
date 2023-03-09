import { Collider, GameObject, Quaternion, Transform, Vector3 } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import ClientStarter from '../ZepetoScripts/Multiplay/ClientStarter';

export default class WorldFallout extends ZepetoScriptBehaviour {

    private spawnPoint : Transform;
    
    Start()
    {
        const spawnObject = GameObject.FindWithTag("SpawnPoint");
        if(spawnObject != null)
            this.spawnPoint = spawnObject.transform;
    }

    OnTriggerEnter(collider:Collider)
    {
        if (collider.tag != "Player")                                                                          // tag 확인
            return;

        const character = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.gameObject;                // localPlayer 작동 확인
        if(collider.gameObject != character)
            return;

        this.StartCoroutine(this.ReturnWorldSpawnPoint());
    }

    private * ReturnWorldSpawnPoint()
    {
        ClientStarter.instance.SendRoomServerLog(`월드 밖으로 떨어졌습니다.`);
        console.log(` 월드 밖으로 떨어졌습니다. `);
        
        const character = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        character.enabled = false;
        ZepetoPlayers.instance.controllerData.inputAsset.Disable();
        character.StopMoving();
        let returnPos = Vector3.zero;
        
        if(this.spawnPoint != null)
            returnPos = this.spawnPoint.position;

        character.Teleport(returnPos, Quaternion.identity); // 복귀
        ZepetoPlayers.instance.controllerData.inputAsset.Enable();
        character.enabled = true;
    }
}