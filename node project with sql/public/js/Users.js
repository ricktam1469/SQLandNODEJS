var $$ = $.noConflict();

$$(document).ready(function(){
	// declare variables
	var $tblUsers, $trUser, $overlay, $popup, $legendPopup,
		$txtUserName, $txtEmail, $txtPhone, $txtWebsite, $hdnUserId;
		var url='/Users-sql', checkFileUrl='/CheckUserFile';
		var $uploadFilePopup,$progressUpload,$inputFile,$hdnUserIdForUpload;
	
	// assign variables
	$tblUsers = $$('#tblUsers');
	$overlay = $$('#overlay');
	$popup = $$('#popup');
	$legendPopup = $$('#legendPopup');
	$txtUserName = $$('#txtUserName');
	$txtEmail = $$('#txtEmail');
	$txtPhone = $$('#txtPhone');
	$txtWebsite = $$('#txtWebsite');
	$hdnUserId = $$('#hdnUserId');

	$uploadFilePopup=$$('#uploadFilePopup');
	$progressUpload=$$('#progressUpload');
	$inputFile=$$('#inputFile');
	$hdnUserIdForUpload=$$('#hdnUserIdForUpload');

	// define functions
	function OpenPopupForEdit(){
		var $trTBE = $$(this).parents('tr');

		$txtUserName.val($trTBE.find('[info=name]').html());
		$txtEmail.val($trTBE.find('[info=email]').html());
		$txtPhone.val($trTBE.find('[info=phone]').html());
		$txtWebsite.val($trTBE.find('[info=website]').html());
		$hdnUserId.val($trTBE.attr('userid'));
		$legendPopup.html('Edit ' + $txtUserName.val());

		TogglePopup();
	}

	function OpenPopupForAdd(){
		$txtUserName.val('');
		$txtEmail.val('');
		$txtPhone.val('');
		$txtWebsite.val('');
		$hdnUserId.val('');
		$legendPopup.html('Add User');

		TogglePopup();
	}

	function SaveUser(){
		var dataRow;

		if($hdnUserId.val() === ''){ // add user
			dataRow = {
				id: undefined,
				name: $txtUserName.val(),
				email: $txtEmail.val(),
				phone: $txtPhone.val(),
				website: $txtWebsite.val()
			};

			$$.ajax({
			    url:url,
			    method: 'POST',
			    data: dataRow,
			    success: function (data) {
			    	dataRow.id=dataRow.newId;
			        AddRow(dataRow);
			    }
			})
		}
		else{ // edit user
			dataRow = {
				id: $hdnUserId.val(),
				name: $txtUserName.val(),
				email: $txtEmail.val(),
				phone: $txtPhone.val(),
				website: $txtWebsite.val()
			};

			$$.ajax({
			    url:url,
			    method: 'PUT',
			    data: dataRow,
			    success: function (data) {
			        UpdateRow(dataRow);
			    }
			})
		}

		TogglePopup();
	}

	function DeleteRow(){
		if (confirm('Really?')) {
	        var $td = $$(this).parents('tr');

	        $$.ajax({
	            url: url,
	            method: 'DELETE',
	            data: { id: $td.attr('userid') },
	            success: function (data) {
	                $td.remove();
	            }
	        });


	    }

		window.event.preventDefault();
	}

	function AddRow(dataRow){
		var $trTBA = $trUser.clone();

		$trTBA.attr('userid', dataRow.id);
		$trTBA.find('[info=name]').html(dataRow.name);
		$trTBA.find('[info=email]').html(dataRow.email);
		$trTBA.find('[info=phone]').html(dataRow.phone);
		$trTBA.find('[info=website]').html(dataRow.website);

		$tblUsers.append($trTBA);
	}

	function UpdateRow(dataRow){
		var $trTBU = $tblUsers.find('[userid=' + dataRow.id + ']');

		$trTBU.attr('userid', dataRow.id);
		$trTBU.find('[info=name]').html(dataRow.name);
		$trTBU.find('[info=email]').html(dataRow.email);
		$trTBU.find('[info=phone]').html(dataRow.phone);
		$trTBU.find('[info=website]').html(dataRow.website);
	}

	function onDataLoad(responseData){
		$$.each(responseData, function(index, value){
			AddRow(value);
		});
	}

	function TogglePopup(){
		$overlay.toggle();
		$popup.toggle();
	}

	///////////////////////Upload and Download functions/////////////////////////////////////////////////
	function OpenPopupForUpload(){
		$progressUpload.attr('value',0);
		$hdnUserIdForUpload.val($$(this).parents('tr').attr('userid'));

		$overlay.show();
		$uploadFilePopup.show();
	}

	function DownloadFile(){

		var userid = parseInt($$(this).closest('tr').attr('userid'),10);
        console.log(userid);
        $$.ajax({
            url: checkFileUrl,
            method: 'PUT',
            data: { 
               id: userid 
            },
            success: function (data) {
                console.log(data);
                if (data) {
                    window.open('/Download/' + userid, { target: "_blank" });
                }
                else {
                    alert('No File Exists');
                }
            },
            error: function () { },
            async: true
        });

	}

	function DismissUploadPopup(){
		$overlay.hide();
		$uploadFilePopup.hide();
	}

	function uploadFile(){

		var userid=$hdnUserIdForUpload.val();
		var fr=new FileReader();
		var filename=$inputFile[0].files[0].name;
		fr.onload=function(evt){

			$$.ajax({
					url:'/Upload',
					method:'PUT',
					data:{
						userid:userid,
						content:evt.target.result,
						filename:filename
					},
					success:function(data){
						$progressUpload.val('100');
						DismissUploadPopup();
					}

			});

		}
		fr.readAsText($inputFile[0].files[0]);
		window.event.preventDefault();
	}
	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	// define Init
	function Init(){
		$trUser = $$('<tr />');
		$trUser.append('<td info="action"><a action="edit" href="#">Edit</a> | <a action="delete" href="#">Delete</a></td>');
		$trUser.append('<td info="action"><a action="upload" href="#">Upload</a> | <a action="download" href="#">Download</a></td>');
		$trUser.append('<td info="name"></td>');
		$trUser.append('<td info="email"></td>');
		$trUser.append('<td info="phone"></td>');
		$trUser.append('<td info="website"></td>');

		$$.ajax({
			url:url,
			method:'GET',
			data:null,
			success:function(data){
				onDataLoad(data);
			}
		});
	//	$$.getJSON('http://jsonplaceholder.typicode.com/users', 
	//			   null, onDataLoad);

		$$('#tblUsers').on('click', '[action=delete]', DeleteRow);
		$$('#tblUsers').on('click', '[action=edit]', OpenPopupForEdit);
		$$(document).on('click', '#btnAdd', OpenPopupForAdd);
		$$(document).on('click', '#btnCancel', TogglePopup);
		$$(document).on('click', '#btnSave', SaveUser);

		//////////////////////Upload and Download//////////////////////////
		$$('#tblUsers').on('click', '[action=upload]', OpenPopupForUpload);
		$$('#tblUsers').on('click', '[action=download]', DownloadFile);
		$$(document).on('click', '#btnCancelFile', DismissUploadPopup);
		$$(document).on('click', '#btnUploadFile', uploadFile);
		//////////////////////////////////////////////////////////////////
	}

	// Call Init
	Init();
});