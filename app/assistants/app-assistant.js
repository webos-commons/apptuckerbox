var prefs = new preferenceCookie();
var vers =  new versionCookie();
var DeviceProfile =  new deviceProfile();
var PalmProfile =  new palmProfile();
var AccountServer =  new accountServer();

// stage names
var mainStageName = 'apptuckerbox-main';

function AppAssistant() {}

AppAssistant.prototype.handleLaunch = function(params)
{
	var mainStageController = this.controller.getStageController(mainStageName);
	
	try {
		// launch from launcher tap
		if (mainStageController) {
			mainStageController.popScenesTo('main');
			mainStageController.activate();
		}
		else {
			this.controller.createStageWithCallback({name: mainStageName, lightweight: true}, this.launchFirstScene.bind(this));
		}
	}
	catch (e) {
		Mojo.Log.logException(e, "AppAssistant#handleLaunch");
	}
};

AppAssistant.prototype.launchFirstScene = function(controller)
{
    vers.init();
    if (vers.showStartupScene()) {
		controller.pushScene('startup');
    }
    else {
		controller.pushScene('main');
	}
};

AppAssistant.prototype.cleanup = function(event)
{
	alert('AppAssistant#cleanup');
};


// Local Variables:
// tab-width: 4
// End:
