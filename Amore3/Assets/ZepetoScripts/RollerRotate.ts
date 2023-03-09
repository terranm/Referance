import { Time, Vector3, WaitForSeconds } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class RollerRotate extends ZepetoScriptBehaviour {

    tick: WaitForSeconds = new WaitForSeconds(0.1);

    Start() {    
        //this.StartCoroutine(this.Rotate());
    }

    *Rotate()
    {
        while (true)
        {
            yield this.tick;
            this.transform.Rotate(Vector3.right * Time.deltaTime);
        }
        
    }

}