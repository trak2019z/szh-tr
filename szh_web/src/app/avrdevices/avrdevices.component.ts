import { Component, OnInit } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { AvrDevicesService } from '../services/avrDevices.service';
import { TunnelsService } from '../services/tunnels.service';
import { trigger,style,transition,animate,keyframes,query,stagger } from '@angular/animations';
import { LoadingSpinnerComponent } from '../ui/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-avrdevices',
  templateUrl: './avrdevices.component.html',
  styleUrls: ['./avrdevices.component.scss'],
  animations: [

    trigger('showingAnnimation', [
      transition('* => *', [
        query(':enter',style({opacity: 0}), {optional: true}),
        query(':enter',stagger('050ms',[
          animate('.4s ease-in',keyframes([
            style({opacity: 0,transform: 'translateY(-20%)',offset:0}),
            style({opacity: .5,transform: 'translateY(20px)',offset:.3}),
            style({opacity: 1,transform: 'translateY(0)',offset:1})
          ]))
        ]), {optional: true})
      ])
    ])
  ]
})
export class AvrdevicesComponent implements OnInit {

  public loadingSpinner: LoadingSpinnerComponent;

  //getting data
  private intervalId;
  private getAvrDevicesSubscription: ISubscription;
  private getTunnelsSubscription: ISubscription;
  private addNewAvrDeviceSubscription: ISubscription;

  avrDeviceIpForm;
  avrDeviceTunnelForm;


  avrDevices;
  tunnels;

  //Creating new avr
  messageIsShowing: boolean;
  responseIsOk: boolean;

  constructor(
    private _avrDeviceInfoService: AvrDevicesService,
    private _tunnelsService: TunnelsService) { }

  ngOnInit() {
    this.loadingSpinner = new LoadingSpinnerComponent();
    this.getAvrDevices();
    this.getTunnels();
    this.intervalId = setInterval(() => { this.getAvrDevices(); }, 5000);
  }

  ngOnDestroy() {
    if (this.getAvrDevicesSubscription) {
      this.getAvrDevicesSubscription.unsubscribe();
    }
    if (this.getTunnelsSubscription) {
      this.getTunnelsSubscription.unsubscribe();
    }
    if (this.addNewAvrDeviceSubscription) {
      this.addNewAvrDeviceSubscription.unsubscribe();
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  getAvrDevices(){

    this.loadingSpinner.startLoadingDate = new Date();
    
    this.getAvrDevicesSubscription = this._avrDeviceInfoService.getAvrDevicesInfo().subscribe(
      data => { this.avrDevices = data },
      err => console.error('Erroren :' + err),
      () => {
        let executionTime = this.loadingSpinner.GetLoadingTime();
        if(executionTime < this.loadingSpinner.minLoadingTime){
          setTimeout(()=>{this.loadingSpinner.loadingView = false; }, this.loadingSpinner.minLoadingTime - executionTime)
        }
      }
    );
  }

  getTunnels(){
    this.getTunnelsSubscription = this._tunnelsService.getTunnels().subscribe(
      data => {this.tunnels = data},
      err => console.error(err),
      () => {}
    )
  }

  onAddNewAvrDeviceSubmit(avrDevice){

    avrDevice.tunnel = this.tunnels.find(x => x.id == avrDevice.tunnel)
    this.addNewAvrDeviceSubscription = this._avrDeviceInfoService.createAvrDevice(avrDevice).subscribe(
      data => { },
      err => { this.responseIsOk = false; this.messageIsShowing = true; console.log(err);},
      () => { this.responseIsOk = true; this.messageIsShowing = true; this.getAvrDevices();}
    );    
  }

}
