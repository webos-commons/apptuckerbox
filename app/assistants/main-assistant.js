function MainAssistant()
{
	// subtitle random list
	this.randomSub =
		[
		 {weight: 30, text: $L('Your Apps On Your Devices')}
		 ];
	
	// setup list model
	this.mainModel = {items:[]};
	
	// setup menu
	this.menuModel = {
		visible: true,
		items: [
	{
		label: $L("Refresh"),
		command: 'do-refresh'
	},
	{
		label: $L("Deregister"),
		command: 'do-deregister'
	},
	{
		label: $L("Preferences"),
		command: 'do-prefs'
	},
	{
		label: $L("Help"),
		command: 'do-help'
	}
				]
	};

	this.registerDeviceButtonModel = {
		label: $L("Begin Device Registration"),
		buttonClass: 'affirmative',
		disabled: true
	};
	
	this.deregisterDeviceButtonModel = {
		label: $L("Deregister Device"),
		buttonClass: 'affirmative',
		disabled: true
	};
	
	this.refreshStatusButtonModel = {
		label: $L("Check Registration Status"),
		buttonClass: 'affirmative',
		disabled: true
	};
	
	this.feedLocaleSelectorModel = {
		disabled: true,
		choices: [
	{label:"English (Australia)",	value:'en_AU'},
	{label:"English (Canada)",		value:'en_CA'},
	{label:"English (Germany)",		value:'en_DE'},
	{label:"English (Spain)",		value:'en_ES'},
	{label:"English (France)",		value:'en_FR'},
	{label:"English (Hong Kong)",	value:'en_HK'},
	{label:"English (Ireland)",		value:'en_IE'},
	{label:"English (Mexico)",		value:'en_MX'},
	{label:"English (New Zealand)",	value:'en_NZ'},
	{label:"English (Singapore)",	value:'en_SG'},
	{label:"English (UK)",			value:'en_GB'},
	{label:"English (USA)",			value:'en_US'},
	{label:"French (Canada)",		value:'fr_CA'},
	{label:"French (France)",		value:'fr_FR'},
	{label:"German (Germany)",		value:'de_DE'},
	{label:"Spanish (Spain)",		value:'es_ES'},
	{label:"Spanish (Mexico)",		value:'es_MX'},
	{label:"Spanish (USA)",			value:'es_US'}
				  ],
	};

	var locale = (Mojo.Locale.getCurrentLocale().substr(0,2) + "_" +
				  Mojo.Locale.getCurrentLocale().substr(3,2).toUpperCase());

	switch (locale) {
	case 'en_AU':
	case 'en_CA':
	case 'en_DE':
	case 'en_ES':
	case 'en_FR':
	case 'en_HK':
	case 'en_IE':
	case 'en_MX':
	case 'en_NZ':
	case 'en_SG':
	case 'en_GB':
	case 'en_US':
	case 'fr_CA':
	case 'fr_FR':
	case 'de_DE':
	case 'es_ES':
	case 'es_MX':
	case 'es_US':
		this.feedLocaleSelectorModel.value = locale;
		break;
	default:
		this.feedLocaleSelectorModel.value = "en_US";
		break;
	}

	this.configureFeedsButtonModel = {
		label: $L("Configure Preware Feeds"),
		buttonClass: 'affirmative',
		disabled: true
	};
	
	this.server = "ipkg.apptuckerbox.com";

	this.deviceProfile = false;
	this.reloadDeviceProfile = false;

	this.locationHost = false;
	this.reloadLocationHost = false;

	this.palmProfile = false;
	this.reloadPalmProfile = false;

	// These are calculated once when the deviceProfile, locationHost and palmProfile are loaded
	this.username   = false;
	this.password   = false;
	this.salt       = false;
	this.userdata   = false;
	this.ciphertext = false;
	this.userdocrev = false;
};

MainAssistant.prototype.setup = function()
{
    // set theme because this can be the first scene pushed
	var deviceTheme = '';
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Pixi' ||
		Mojo.Environment.DeviceInfo.modelNameAscii == 'Veer')
		deviceTheme += ' small-device';
	if (Mojo.Environment.DeviceInfo.modelNameAscii.indexOf('TouchPad') == 0 ||
		Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator')
		deviceTheme += ' no-gesture';
    this.controller.document.body.className = prefs.get().theme + deviceTheme;
	
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.overlay = 			this.controller.get('overlay'); this.overlay.hide();
	this.spinnerElement =	this.controller.get('spinner');
	this.iconElement =		this.controller.get('icon');
	this.titleElement =		this.controller.get('main-title');
	this.versionElement =	this.controller.get('version');
	this.subTitleElement =	this.controller.get('subTitle');

	this.statusGroup = this.controller.get('statusGroup');
	this.statusTitle = this.controller.get('statusTitle');
	this.statusLabel = this.controller.get('statusLabel');

	this.registerDeviceGroup = this.controller.get('registerDeviceGroup');
	this.registerDeviceTitle = this.controller.get('registerDeviceTitle');
	this.registerDeviceButton = this.controller.get('registerDeviceButton');

	this.deregisterDeviceGroup = this.controller.get('deregisterDeviceGroup');
	this.deregisterDeviceTitle = this.controller.get('deregisterDeviceTitle');
	this.deregisterDeviceButton = this.controller.get('deregisterDeviceButton');

	this.refreshStatusGroup = this.controller.get('refreshStatusGroup');
	this.refreshStatusTitle = this.controller.get('refreshStatusTitle');
	this.refreshStatusButton = this.controller.get('refreshStatusButton');

	this.configureFeedsGroup = this.controller.get('configureFeedsGroup');
	this.configureFeedsTitle = this.controller.get('configureFeedsTitle');
	this.feedLocaleSelector = this.controller.get('feedLocaleSelector');
	this.configureFeedsButton = this.controller.get('configureFeedsButton');

	this.infoGroup = this.controller.get('infoGroup');
	this.infoTitle = this.controller.get('infoTitle');
	this.infoLabel = this.controller.get('infoLabel');

	// set version string random subtitle
	this.titleElement.innerHTML = Mojo.Controller.appInfo.title;
	this.versionElement.innerHTML = "v" +  Mojo.Controller.appInfo.version;
	this.subTitleElement.innerHTML = this.getRandomSubTitle();
	
	// setup handlers
	this.isRegisteredHandler = this.isRegistered.bindAsEventListener(this);
	this.registerDeviceTapHandler = this.registerDeviceTap.bindAsEventListener(this);
	this.registerDeviceSentHandler = this.registerDeviceSent.bindAsEventListener(this);
	this.registerDeviceStoredHandler = this.registerDeviceStored.bindAsEventListener(this);
	this.registerDeviceUsedHandler = this.registerDeviceUsed.bindAsEventListener(this);
	this.registerDeviceAckHandler = this.registerDeviceAck.bindAsEventListener(this);
	this.addUserAccountHandler = this.addUserAccount.bindAsEventListener(this);
	this.configureFeedsTapHandler = this.configureFeedsTap.bindAsEventListener(this);
	this.refreshStatusTapHandler = this.refreshStatusTap.bindAsEventListener(this);
	this.deregisterDeviceTapHandler = this.deregisterDeviceTap.bindAsEventListener(this);
	this.deregisterDeviceAckHandler = this.deregisterDeviceAck.bindAsEventListener(this);
	this.deleteUserAccountHandler = this.deleteUserAccount.bindAsEventListener(this);

    // setup widgets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'large'}, this.spinnerModel);

	this.controller.setupWidget('registerDeviceButton', { type: Mojo.Widget.activityButton },
								this.registerDeviceButtonModel);
	this.controller.listen(this.registerDeviceButton, Mojo.Event.tap, this.registerDeviceTapHandler);

	this.controller.setupWidget('deregisterDeviceButton', { type: Mojo.Widget.activityButton },
								this.deregisterDeviceButtonModel);
	this.controller.listen(this.deregisterDeviceButton, Mojo.Event.tap, this.deregisterDeviceTapHandler);

	this.controller.setupWidget('refreshStatusButton', { type: Mojo.Widget.activityButton },
								this.refreshStatusButtonModel);
	this.controller.listen(this.refreshStatusButton, Mojo.Event.tap, this.refreshStatusTapHandler);

	this.controller.setupWidget('feedLocaleSelector', { label: $L("Locale") }, this.feedLocaleSelectorModel);
	this.controller.setupWidget('configureFeedsButton', { type: Mojo.Widget.activityButton },
								this.configureFeedsButtonModel);
	this.controller.listen(this.configureFeedsButton, Mojo.Event.tap, this.configureFeedsTapHandler);

};

MainAssistant.prototype.activate = function()
{
	this.statusLabel.innerHTML = $L("Reading Device Information ...");

	this.registerDeviceGroup.style.display = 'none';
	this.registerDeviceButtonModel.disabled = true;
	this.controller.modelChanged(this.registerDeviceButtonModel);

	this.deregisterDeviceGroup.style.display = 'none';
	this.deregisterDeviceButtonModel.disabled = true;
	this.controller.modelChanged(this.deregisterDeviceButtonModel);

	this.refreshStatusGroup.style.display = 'none';
	this.refreshStatusButtonModel.disabled = true;
	this.controller.modelChanged(this.refreshStatusButtonModel);

	this.configureFeedsGroup.style.display = 'none';
	this.feedLocaleSelectorModel.disabled = true;
	this.controller.modelChanged(this.feedLocaleSelectorModel);
	this.configureFeedsButtonModel.disabled = true;
	this.controller.modelChanged(this.configureFeedsButtonModel);

	this.infoGroup.style.display = 'none';
	this.infoLabel.innerHTML = '';

	this.deviceProfile = false;
	this.updateSpinner(true);
	DeviceProfile.getDeviceProfile(this.getDeviceProfile.bind(this), this.reloadDeviceProfile);
};

MainAssistant.prototype.dirtyDeviceProfile = function()
{
	this.reloadDeviceProfile = true;
};

MainAssistant.prototype.getDeviceProfile = function(returnValue, deviceProfile, errorText)
{
	this.updateSpinner(false);

	// Uncomment for testing
	// returnValue = false;

	if (returnValue === false) {
		this.errorMessage($L('Device Profile Error'),
						  $L('App Tuckerbox cannot retrieve the Device Profile and is unable to operate in this condition. Please seek assistance.'));
		return;
	}

	this.deviceProfile = deviceProfile;
	this.reloadDeviceProfile = false;

	// Uncomment for testing
	// this.deviceProfile = false;

	if (this.deviceProfile) {
		this.locationHost = false;
		this.updateSpinner(true);
		AccountServer.getLocationHost(this.getLocationHost.bind(this), this.reloadLocationHost);
	}
	else {
		this.errorMessage($L('Device Profile Not Found'),
						  $L('App Tuckerbox cannot retrieve the Device Profile and is unable to operate in this condition. Please seek assistance.'));
	}
};

MainAssistant.prototype.dirtyLocationHost = function()
{
	this.reloadLocationHost = true;
};

MainAssistant.prototype.getLocationHost = function(returnValue, locationHost, errorText)
{
	this.updateSpinner(false);

	// Uncomment for testing
	// returnValue = false;

	if (returnValue === false) {
		this.errorMessage($L('Palm Profile Error'),
						  $L('App Tuckerbox cannot retrieve the Location Host and is unable to operate in this condition. Please seek assistance.'));
		return;
	}

	this.locationHost = locationHost;
	this.reloadLocationHost = false;

	// Uncomment for testing
	// this.locationHost = false;

	if (this.locationHost) {
		this.palmProfile = false;
		this.updateSpinner(true);
		PalmProfile.getPalmProfile(this.getPalmProfile.bind(this), this.reloadPalmProfile);
	}
	else {
		this.errorMessage($L('Location Host Not Found'),
						  $L('App Tuckerbox cannot retrieve the Location Host and is unable to operate in this condition. Please seek assistance.'));
	}
};

MainAssistant.prototype.dirtyPalmProfile = function()
{
	this.reloadPalmProfile = true;
};

MainAssistant.prototype.getPalmProfile = function(returnValue, palmProfile, errorText)
{
	this.updateSpinner(false);

	// Uncomment for testing
	// returnValue = false;

	if (returnValue === false) {
		this.errorMessage($L('Palm Profile Error'),
						  $L('App Tuckerbox cannot retrieve the Palm Profile and is unable to operate in this condition. Please seek assistance.'));
		return;
	}

	this.palmProfile = palmProfile;
	this.reloadPalmProfile = false;

	// Uncomment for testing
	// this.palmProfile = false;

	if (this.palmProfile) {

		// Each unique email/device/token combination gets a unique account in the catalog database
		var sum = hex_sha1(this.palmProfile.alias+":"+this.deviceProfile.deviceId+":"+this.palmProfile.token);

		this.username = sum.substring(0,24);
		this.password = sum.substring(24,40);

		this.salt = hex_sha1(this.deviceProfile.deviceId+":"+this.palmProfile.token);

		this.userdata = {
			"email" : this.palmProfile.alias,
			"device" : this.deviceProfile.deviceId,
			"token" : this.palmProfile.token,
			"server" : this.locationHost
			// Other fields can be added here without affecting authentication
		};
	
		this.statusLabel.innerHTML = $L("Encrypting User Information ...");

		this.updateSpinner(true);
		this.requestPalmService = TuckerboxService.encrypt(this.getCiphertext.bind(this), this.userdata);
	}
	else {
		this.errorMessage($L('Palm Profile Not Found'),
						  $L('This device does not have an active Palm Profile associated with it.<br>App Tuckerbox is unable to operate in this condition. Please seek assistance.'));
	}
};

MainAssistant.prototype.getCiphertext = function(payload)
{
	this.updateSpinner(false);

	// Uncomment for testing
	// payload.returnValue = false;

	if ((payload.returnValue === false) ||
		(payload.stdOut == undefined) ||
		(payload.stdOut.length == 0)) {
		this.errorMessage($L('Encryption Error'),
						  $L('App Tuckerbox cannot encrypt your information and is unable to operate in this condition. Please seek assistance.'));
		return;
	}
	
	this.ciphertext = payload.stdOut.join('\n');

	this.checkRegistration();
};

MainAssistant.prototype.checkRegistration = function()
{
	this.registerDeviceGroup.style.display = 'none';
	this.registerDeviceButtonModel.disabled = true;
	this.controller.modelChanged(this.registerDeviceButtonModel);

	this.deregisterDeviceGroup.style.display = 'none';
	this.deregisterDeviceButtonModel.disabled = true;
	this.controller.modelChanged(this.deregisterDeviceButtonModel);

	this.refreshStatusGroup.style.display = 'none';
	this.refreshStatusButtonModel.disabled = true;
	this.controller.modelChanged(this.refreshStatusButtonModel);

	this.configureFeedsGroup.style.display = 'none';
	this.feedLocaleSelectorModel.disabled = true;
	this.controller.modelChanged(this.feedLocaleSelectorModel);
	this.configureFeedsButtonModel.disabled = true;
	this.controller.modelChanged(this.configureFeedsButtonModel);

	var url = "https://" + this.server + "/api/users/" + encodeURIComponent(this.username);
	var options = { "method": "GET" };
	var callback = this.isRegisteredHandler;
	
	this.overlay.show();

	this.requestWebService = this.CouchRequest(url, options, callback);
}

MainAssistant.prototype.isRegistered = function(payload)
{
	this.requestWebService = false;

	this.overlay.hide();

	// Uncomment for testing
	// payload.returnValue = false;

	this.infoGroup.style.display = '';
	this.infoTitle.innerHTML = $L('Registration Details');

	if (payload.returnValue === false) {
		this.statusLabel.innerHTML = $L("Registration Required");

		this.registerDeviceGroup.style.display = '';
		this.registerDeviceTitle.innerHTML = $L('Device Registration Required');
		this.registerDeviceButtonModel.disabled = false;
		this.controller.modelChanged(this.registerDeviceButtonModel);

		this.infoLabel.innerHTML = ('<b>'+$L("Encrypted Account Info")+'</b>: '+this.ciphertext.replace(/\n/g,''));

		this.userdocrev = false;
	}
	else {

		this.registerDeviceGroup.style.display = 'none';

		this.infoLabel.innerHTML = ('<b>'+$L("ID")+'</b>: '+this.username+'<br>'+
									'<b>'+$L("Password")+'</b>: '+this.password);

		if (payload.roles.length == 0) {
			this.statusLabel.innerHTML = $L("Registration Submitted");

			this.refreshStatusGroup.style.display = '';
			this.refreshStatusTitle.innerHTML = $L('Check Registration Progress');
			this.refreshStatusButtonModel.disabled = false;
			this.controller.modelChanged(this.refreshStatusButtonModel);

		}
		else if (payload.roles[0] == "revoked") {
			this.statusLabel.innerHTML = $L("Registration Update Required");

			this.deregisterDeviceGroup.style.display = '';
			this.deregisterDeviceTitle.innerHTML = $L('Registration Update Required');
			this.deregisterDeviceButtonModel.disabled = false;
			this.controller.modelChanged(this.deregisterDeviceButtonModel);

			this.infoLabel.innerHTML = ('<b>'+$L("Encrypted Account Info")+'</b>: '+this.ciphertext.replace(/\n/g,''));
		}
		else {
			this.statusLabel.innerHTML = $L("Registration Completed");

			this.configureFeedsGroup.style.display = '';
			this.configureFeedsTitle.innerHTML = $L('Feed Configuration Available');
			this.feedLocaleSelectorModel.disabled = false;
			this.controller.modelChanged(this.feedLocaleSelectorModel);
			this.configureFeedsButtonModel.disabled = false;
			this.controller.modelChanged(this.configureFeedsButtonModel);
		}

		if (payload.statusMessage) {
			this.statusLabel.innerHTML = payload.statusMessage;
		}

		this.userdocrev = payload.revision;
	}
}

MainAssistant.prototype.registerDeviceTap = function()
{
	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			title:				'What Is Sent To The Servers?',
			message:			"A highly encrypted message is sent to our secure servers containing only your email address, your device id number and your profile authorisation token.<br><br><b>Your profile password and credit card details remain secret and are never sent to the App Tuckerbox servers.</b>",
			choices:			[{label:$L("I Understand What Is Sent"), value:'sent', type:'affirmative'},{label:$L("Cancel"), value:'cancel', type:'negative'}],
			onChoose:			this.registerDeviceSentHandler
		});
};

MainAssistant.prototype.registerDeviceSent = function(value)
{
	if (value != "sent") {
		this.overlay.hide();
		this.registerDeviceButton.mojo.deactivate();
		return;
	}
	
	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			title:				'How Is It Securely Stored?',
			message:			"Your information is stored on the secure servers using the industry standard RSA encryption algorithm and protected with a military-grade 4096 bit key.<br><br><b>We encourage anyone to verify the strength of our encryption algorithm.</b>",
			choices:			[{label:$L("I Understand How It Is Stored"), value:'stored', type:'affirmative'},{label:$L("Cancel"), value:'cancel', type:'negative'}],
			onChoose:			this.registerDeviceStoredHandler
		});
};

MainAssistant.prototype.registerDeviceStored = function(value)
{
	if (value != "stored") {
		this.overlay.hide();
		this.registerDeviceButton.mojo.deactivate();
		return;
	}
	
	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			title:				'How Is My Information Used?',
			message:			"A secure verification process running on the App Tuckerbox servers temporarily decrypts your stored encrypted info to verify your account status and add the information about your accessible apps to the App Tuckerbox feeds.",
			choices:			[{label:$L("I Agree To This Use"), value:'used', type:'affirmative'},{label:$L("Cancel"), value:'cancel', type:'negative'}],
			onChoose:			this.registerDeviceUsedHandler
		});
};

MainAssistant.prototype.registerDeviceUsed = function(value)
{
	if (value != "used") {
		this.overlay.hide();
		this.registerDeviceButton.mojo.deactivate();
		return;
	}
	
	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			title:				'Please Register My Device',
			message:			"I wish to proceed with registration of my device on the App Tuckerbox servers, where my account information and information about my accessible apps will be securely stored.",
			choices:			[{label:$L("Complete Device Registration"), value:'register', type:'affirmative'},{label:$L("Cancel"), value:'cancel', type:'negative'}],
			onChoose:			this.registerDeviceAckHandler
		});
};

MainAssistant.prototype.registerDeviceAck = function(value)
{
	if (value != "register") {
		this.overlay.hide();
		this.registerDeviceButton.mojo.deactivate();
		return;
	}
	
	var body = {
		"name": this.username, "salt" : this.salt, "hash" : hex_sha1(this.password+this.salt),
		"apiVersion": Mojo.Controller.appInfo.version.slice(0, Mojo.Controller.appInfo.version.lastIndexOf(".")),
		"accountInfo": this.ciphertext
	};

	var url = "https://" + this.server + "/api/users/" + encodeURIComponent(this.username);
	var options = { "method": "PUT", "postBody": JSON.stringify(body) };
	var callback = this.addUserAccountHandler;

	this.overlay.show();
	this.requestWebService = this.CouchRequest(url, options, callback);
};

MainAssistant.prototype.addUserAccount = function(payload)
{
	this.requestWebService = false;

	this.registerDeviceButton.mojo.deactivate();
	this.overlay.hide();

	if (payload.returnValue === false) {
		this.checkRegistration();
		this.errorMessage($L('Registration Failed'),
						  ("<b>"+$L('Status')+"</b>: "+payload.status+"<br>"+
						   "<b>"+$L('Error')+"</b>: "+payload.error+"<br>"+
						   "<b>"+$L('Reaon')+"</b>: "+payload.message));
	}
	else {
		this.checkRegistration();
		this.statusMessage($L('Registration Submitted'),
						   ("<b>"+$L('ID')+"</b>: "+this.username+"<br>"+
							"<b>"+$L('Password')+"</b>: "+this.password));
	}
};

MainAssistant.prototype.deregisterDeviceTap = function()
{
	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			title:				'Please Deregister My Device',
			message:			"I wish to proceed with deregistration of my device, which will delete my account information and revoke access to the App Tuckerbox feeds.",
			choices:			[{label:$L("Deregister Device"), value:'deregister', type:'affirmative'},{label:$L("Cancel"), value:'cancel', type:'negative'}],
			onChoose:			this.deregisterDeviceAckHandler
		});
};

MainAssistant.prototype.deregisterDeviceAck = function(value)
{
	if (value != "deregister") {
		this.overlay.hide();
		this.deregisterDeviceButton.mojo.deactivate();
		return;
	}
	
	var url = ("https://" + this.server + "/api/users/" + encodeURIComponent(this.username) + "/" + encodeURIComponent(this.userdocrev));
	var options = {
		"method": "DELETE",
		"contentType": "application/x-www-form-urlencoded",
		"postBody": "name="+encodeURIComponent(this.username)+"&password="+encodeURIComponent(this.password)
	};
	var callback = this.deleteUserAccountHandler;
	
	this.overlay.show();
	this.requestWebService = this.CouchRequest(url, options, callback);
};

MainAssistant.prototype.deleteUserAccount = function(payload)
{
	this.requestWebService = false;

	this.deregisterDeviceButton.mojo.deactivate();
	this.overlay.hide();

	this.checkRegistration();

	if (payload.returnValue === false) {
		this.errorMessage($L('Deregistration Failed'),
						  ("<b>"+$L('Status')+"</b>: "+payload.status+"<br>"+
						   "<b>"+$L('Error')+"</b>: "+payload.error+"<br>"+
						   "<b>"+$L('Reaon')+"</b>: "+payload.message));
	}
	else {
		this.statusMessage($L('Deregistration Complete'), 'Your account information has been deleted and access to the App Tuckerbox feeds has been revoked.');
	}
};

MainAssistant.prototype.refreshStatusTap = function()
{
	this.refreshStatusButton.mojo.deactivate();
	this.checkRegistration();
};

MainAssistant.prototype.configureFeedsTap = function()
{
	this.statusLabel.innerHTML = $L("Configuring Preware Feeds ...");

	var palmCatalog = ("src/gz palm-catalog https://"+
					   encodeURIComponent(this.username)+":"+
					   encodeURIComponent(this.password)+"@"+
					   this.server+"/feeds/palm-catalog/"+this.feedLocaleSelectorModel.value);

	this.overlay.show();
	this.requestPalmService = TuckerboxService.putFile(this.putPalmCatalog.bind(this),
													   palmCatalog,
													   "file:///media/cryptofs/apps/etc/ipkg/palm-catalog.conf");
};

MainAssistant.prototype.putPalmCatalog = function(payload)
{
	this.requestPalmService = false;

	if (payload.returnValue === false) {
		this.overlay.hide();
		this.configureFeedsButton.mojo.deactivate();
		this.checkRegistration();
		this.errorMessage($L('Feed Configuration Failed'),
						  "<b>"+$L('Error')+"</b>: "+payload.errorText);
		return;
	}

	var palmWeb = ("src/gz palm-web https://"+
				   encodeURIComponent(this.username)+":"+
				   encodeURIComponent(this.password)+"@"+
				   this.server+"/feeds/palm-web/"+this.feedLocaleSelectorModel.value);

	this.requestPalmService = TuckerboxService.putFile(this.putPalmWeb.bind(this),
													   palmWeb,
													   "file:///media/cryptofs/apps/etc/ipkg/palm-web.conf");
};

MainAssistant.prototype.putPalmWeb = function(payload)
{
	this.requestPalmService = false;

	if (payload.returnValue === false) {
		this.overlay.hide();
		this.configureFeedsButton.mojo.deactivate();
		this.checkRegistration();
		this.errorMessage($L('Feed Configuration Failed'),
						  "<b>"+$L('Error')+"</b>: "+payload.errorText);
		return;
	}

	var palmBeta = ("src/gz palm-beta https://"+
					encodeURIComponent(this.username)+":"+
					encodeURIComponent(this.password)+"@"+
					this.server+"/feeds/palm-beta/"+this.feedLocaleSelectorModel.value);

	this.requestPalmService = TuckerboxService.putFile(this.putPalmBeta.bind(this),
													   palmBeta,
													   "file:///media/cryptofs/apps/etc/ipkg/palm-beta.conf");
};

MainAssistant.prototype.putPalmBeta = function(payload)
{
	this.requestPalmService = false;
	this.overlay.hide();
	this.configureFeedsButton.mojo.deactivate();

	if (payload.returnValue === false) {
		this.checkRegistration();
		this.errorMessage($L('Feed Configuration Failed'),
						  "<b>"+$L('Error')+"</b>: "+payload.errorText);
	}
	else {
		this.statusLabel.innerHTML = $L("Preware Feeds Configured");
		this.configureFeedsGroup.style.display = 'none';
		this.statusMessage($L('Feed Configuration Complete'),
						   "The <b>palm-beta</b>, <b>palm-catalog</b> and <b>palm-web</b> feeds are now configured and ready for your immediate use.<br>Enable with <b>Preware &rarr; Manage Feeds</b> and load with <b>Preware &rarr; Update Feeds</b>.<br>Also enable the <b>Use App Tuckerbox</b> and <b>Ignore Device Compatibility</b> options in <b>Preware &rarr; Preferences</b>.");
	}
};

MainAssistant.prototype.getRandomSubTitle = function()
{
	// loop to get total weight value
	var weight = 0;
	for (var r = 0; r < this.randomSub.length; r++) {
		weight += this.randomSub[r].weight;
	}
	
	// random weighted value
	var rand = Math.floor(Math.random() * weight);
	//alert('rand: ' + rand + ' of ' + weight);
	
	// loop through to find the random title
	for (var r = 0; r < this.randomSub.length; r++) {
		if (rand <= this.randomSub[r].weight) {
			return this.randomSub[r].text;
		}
		else {
			rand -= this.randomSub[r].weight;
		}
	}
	
	// if no random title was found (for whatever reason, wtf?) return first and best subtitle
	return this.randomSub[0].text;
};

MainAssistant.prototype.updateSpinner = function(active)
{
	if (active) {
		this.spinnerModel.spinning = true;
		this.controller.modelChanged(this.spinnerModel);
		this.overlay.show();
	}
	else {
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel);
		this.overlay.hide();
	}
};

MainAssistant.prototype.statusMessage = function(title, msg, callback)
{
	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			preventCancel:		true,
			title:				title,
			message:			msg,
			choices:			[{label:$L("Ok"), value:'ok', type:'affirmative'}],
			onChoose:			callback ? callback : function(e){}
		});
};

MainAssistant.prototype.errorMessage = function(title, msg, callback)
{
	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			preventCancel:		true,
			title:				title,
			message:			msg,
			choices:			[{label:$L("Ok"), value:'ok', type:'negative'}],
			onChoose:			callback ? callback : function(e){}
		});
};

MainAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command) {
		switch (event.command) {

		case 'do-refresh':
		this.dirtyDeviceProfile();
		this.dirtyPalmProfile();
		this.dirtyLocationHost();
		this.activate();
		break;

		case 'do-deregister':
		this.deregisterDeviceTap();
		break;

		case 'do-prefs':
		this.controller.stageController.pushScene('preferences');
		break;
		
		case 'do-help':
		this.controller.stageController.pushScene('help');
		break;
		}
	}
};

MainAssistant.prototype.CouchRequest = function(url, options, callback)
{
	if (options.method == "PUT") {
		var headers = options.headers || {};
		headers["X-HTTP-Method-Override"] = "PUT";
		options.method = "POST";
		options.headers = headers;
	}

	if (options.method == "DELETE") {
		var headers = options.headers || {};
		headers["X-HTTP-Method-Override"] = "DELETE";
		options.method = "POST";
		options.headers = headers;
	}

	Mojo.Log.warn("url:%s, options:%j", url, options);
	
	var request = new Ajax.Request(url, {
			method: options.method,
			contentType: options.contentType || 'application/json',
			requestHeaders: options.headers,
			evalJSON: 'force',
			postBody: options.postBody,
			onSuccess: function(response) {
				var print = response; delete print.request; delete print.transport;
				Mojo.Log.warn("CouchRequest/onSuccess %j", print);
				if (response.responseJSON) {
					var payload = response.responseJSON || {};
					payload.returnValue = true;
					payload.status = response.status;
					callback(payload);
				}
				else {
					callback({"returnValue":true, "status":response.status}); // Empty replies are okay
				}
			},
			onFailure: function(response) {
				var print = response; delete print.request; delete print.transport;
				Mojo.Log.warn("CouchRequest/onFailure %j", print);
				if (response.responseJSON) {
					var payload = response.responseJSON || {};
					payload.returnValue = false;
					payload.status = response.status;
					callback(payload);
				}
				else {
					callback({"returnValue":false, "status":response.status});
				}
			},
			on0: function(response) {
				var print = response; delete print.request; delete print.transport;
				Mojo.Log.warn("CouchRequest/on0 %j", print);
				callback({"returnValue":false, "status":response.status,
							"error":"no_connection", "reason":"No network connection."});
			}
		});

	return request;
};
		
MainAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.registerDeviceButton, Mojo.Event.tap, this.registerDeviceTapHandler);
	this.controller.stopListening(this.deregisterDeviceButton, Mojo.Event.tap, this.deregisterDeviceTapHandler);
	this.controller.stopListening(this.refreshStatusButton, Mojo.Event.tap, this.refreshStatusTapHandler);
	this.controller.stopListening(this.configureFeedsButton, Mojo.Event.tap, this.configureFeedsTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
