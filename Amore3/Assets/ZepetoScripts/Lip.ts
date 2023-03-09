import { GameObject, Material, Renderer, Time, Transform, Vector3, WaitForSeconds } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export enum LipNum
{
    Lip,
    MoveLip
}

export default class Lip extends ZepetoScriptBehaviour {


    public material: Material;
    speed: number = 2;
    public movePos: Transform;
    firstPos: Transform;
    tick: WaitForSeconds = new WaitForSeconds(0.01);
    public lipNum: LipNum;

    Start()
    {
        if (this.lipNum == LipNum.Lip)
        {
            this.material = this.transform.GetChild(0).GetChild(3).gameObject.GetComponent<Renderer>().material;
            this.firstPos = GameObject.Find("FirstPos").transform;
        } 
        else
        {
            this.material = this.transform.GetChild(0).GetChild(1).gameObject.GetComponent<Renderer>().material;
            this.firstPos = GameObject.Find("FirstPos").transform;
        }
        
        this.movePos = GameObject.Find("MovePos").transform;
        this.StartCoroutine(this.Move());
    }

    *Move()
    {
        while (true)
        {
            yield this.tick;
            
            let dist = Vector3.Distance(this.movePos.position, this.transform.position);
           
            if (dist < 2.1)
            {
                
                return;
            }
            else
            {
                this.transform.Translate(Vector3.forward * Time.deltaTime * this.speed);
            }
        }
        
    }

}