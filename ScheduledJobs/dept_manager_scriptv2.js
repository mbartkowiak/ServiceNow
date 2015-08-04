//define vars 
var mgrUsers = new Array(); //inital manager change user sys_id pull from department table
var uniqueMgr = new Array(); //only unique values (no duplicates)

var deptUsers = new Array(); //inital department change user sys_id pull from department table
var uniqueDept = new Array(); //only unique values (no duplicates)

var bothUsers = new Array(); //initial department/manager change user sys_id pull from department table
var uniqueBoth = new Array(); //only unique values

var remMgr = new Array();  //array with all values of only users who's managers changed (department/manager changed users removed)
var remDept = new Array(); //array with all values of only users who's departments changed (department/manager changed users removed)

var deptBoth = new Array();
var mgrCount = 0;
var deptCount = 0;
var bothCount = 0;
var strQuery = 'sys_created_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()';
var something = "";
var arrayUtil = new ArrayUtil();


var mgrSysID = "0c990a976f610600534e7b11be3ee445";  //sysid for audit manager item
var deptSysID = "f9065b2c6fc9c240a3f99b9eae3ee467"; //sysid for audit department item

var mgrOnly = "Manager Only";  //for glide query on u_department_changes table
var deptOnly = "Department Only";  //for glide query on u_department_changes table


function findMatch(){

//function to get manager changes
getManager();

//function to get department changes
getDept();

//function to get manager/department changes
getBoth();

//log arrays returned
//gs.log("uniqueMgr = " + uniqueMgr);
//gs.log("uniqueDept = " + uniqueDept);
//gs.log("uniqueBoth = " + uniqueBoth);


//remove all users in uniqueBoth array from uniqueMgr array
for(i=0; i<uniqueMgr.length;i++){
	var tf = arrayUtil.contains(uniqueBoth,uniqueMgr[i]);
	//gs.log("tf = " + tf);
	//gs.log("uniqueBoth[i]=" + uniqueBoth[i]);
	if(tf==false){
		remMgr.push(uniqueMgr[i]);
		//gs.log("did it push?");
	}
}

//gs.log("remMgr = " + remMgr);

//remove all users in uniqueBoth array from uniqueDept array
for(i=0; i<uniqueDept.length;i++){
	var tf = arrayUtil.contains(uniqueBoth,uniqueDept[i]);
	//gs.log("tf = " + tf);
	//gs.log("uniqueBoth[i]=" + uniqueBoth[i]);
	if(tf==false){
		remDept.push(uniqueDept[i]);
		//gs.log("did it push?");
	}
}



//gs.log("remDept = " + remDept);


//get sys_id from user table 
//create catalog item for each user to audit
//create catalog task for item in workflow - have it query department table and get all records
//and put into the description

//createItems(remMgr,mgrSysID,mgrOnly);

createItems(remDept,deptSysID,deptOnly);

}

function createItems(userArray, itemSysID,typeID){
	
//loop through remMgr array creating catalog items for audit user manager
for(i=0; i<userArray.length; i++){
	//get sys_id for current [i] 
	var findName = new GlideRecord('sys_user');
	findName.get(userArray[i]);
	//gs.log(findName.name);
	//gs.log(findName.sys_id);
	var reqby = findName.sys_id;
	
	//create catalog item
	var cartId = GlideGuid.generate(null);
	var cart = new Cart(cartId);
	var item = cart.addItem(itemSysID); 
	cart.setVariable(item, 'requested_for', findName.sys_id);
	var rc = cart.placeOrder(); 
	//gs.addInfoMessage(rc.number);
	//gs.log(rc.number);
	var num = rc.number;
	var reqSysID = rc.sys_id;
	//gs.log("reqSysID = " + reqSysID);
	
	var gr = new GlideRecord('sc_request'); 
	gr.addQuery('number', num);
	gr.query(); 
	while (gr.next()) { 
		//gs.log(gr.number);
		gr.requested_for = reqby;
		gr.update();
	}
	
	var findRI = new GlideRecord('sc_req_item');
	findRI.addQuery('request',reqSysID);
	findRI.query();
	while(findRI.next()){
		//get info
		var getDeptRecs = new GlideRecord('u_department_changes');
		getDeptRecs.addQuery('u_user',reqby);
		getDeptRecs.addEncodedQuery(strQuery);
		getDeptRecs.addQuery('u_change_type', typeID);
		getDeptRecs.query();
		while(getDeptRecs.next()){
			var notes = getDeptRecs.u_number + "\u00A0\u00A0\u00A0\u00A0\u00A0" + getDeptRecs.sys_created_on + "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0" + getDeptRecs.u_user.name + "\u00A0\u00A0\u00A0\u00A0\u00A0" + getDeptRecs.u_change_type + 
			"\u00A0\u00A0\u00A0\u00A0\u00A0" + getDeptRecs.u_old_department.name + "\u00A0\u00A0\u00A0\u00A0\u00A0" + getDeptRecs.u_new_department.name + "\u00A0\u00A0\u00A0\u00A0\u00A0" + getDeptRecs.u_old_manager.name + "\u00A0\u00A0\u00A0\u00A0\u00A0" + getDeptRecs.u_new_manager.name + "\n";		
		
		noteDes = "Number \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0 Created \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0 User \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0 Change Type \u00A0\u00A0\u00A0\u00A0\u00A0 \u00A0\u00A0\u00A0\u00A0\u00A0 Old Dept  \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0 New Dept \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0 Old Manager \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0 New Manager" + " \n";
		findRI.work_notes = noteDes + notes;
		findRI.update();
		}
	}



}
}


function getManager(){
	//run gliderecord query for department change table records that have a type of manager only
	//get sys_ids for those users and push to mgrUsers array
	var target = new GlideRecord('u_department_changes'); //Indicate the table to query from
	target.addQuery('u_change_type', 'Manager Only');
	target.addEncodedQuery(strQuery);
	target.query(); 
	while (target.next()) { 
		mgrUsers.push(target.u_user.toString());
		mgrCount++;
	}

	//get only unique values for mgrUsers array
	uniqueMgr = arrayUtil.unique(mgrUsers);
	//log output
	//gs.log("uniqueMgr = " + uniqueMgr);
	//gs.log("mgrCount = " + mgrCount);
}

function getDept(){
	//run gliderecordy query for department change table records that have a type of department only
	//get sys_ids for those users and push to deptUsers array
	var grDept = new GlideRecord('u_department_changes'); //Indicate the table to query from
	grDept.addQuery('u_change_type', 'Department Only');
	grDept.addEncodedQuery(strQuery);
	grDept.query(); //Execute the query
	while (grDept.next()) { 
		deptUsers.push(grDept.u_user.toString());
		deptCount++;
	}

	//get only unique values for deptUsers array
	
	uniqueDept = arrayUtil.unique(deptUsers);
	//log output
	//gs.log("uniqueDept = " + uniqueDept);
	//gs.log("deptCount = " + deptCount);
}


function getBoth(){
	
	//run gliderecordy query for department change table records that have a type of department & manager
	//get sys_ids for those users and push to deptBoth array
	var grBoth = new GlideRecord('u_department_changes'); //Indicate the table to query from
	grBoth.addQuery('u_change_type', 'Department & Manager');
	grBoth.addEncodedQuery(strQuery);
	grBoth.query(); //Execute the query
	while (grBoth.next()) { 
		deptBoth.push(grBoth.u_user.toString());
		bothCount++;
	}

	//get only unique values for deptUsers array
	uniqueBoth = arrayUtil.unique(deptBoth);
	//return uniqueBoth;
	//log output
	//gs.log("deptBoth = " + deptBoth);
	//gs.log("uniqueBoth = " + uniqueBoth);
	//gs.log("bothCount = " + bothCount);	
	
}


findMatch();

