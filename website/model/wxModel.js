var mongoose = require('./mongoConnect.js')，
	http = require('http');

// 公众号基本信息Scheam
var wxInfoScheam = new mongoose.Schema({
	teacherId: Number,
	appId: String,
	token: String,
	aesKey: String
});
// 学生基本信息Scheam
var studentSchema = new mongoose.Schema({
	studentId: Number,
	wxId: String,
	name: String,
	schoolNum: Number
})

function WxModel(){
	this.token = ''
}
// 获取公众号信息
WxModel.prototype.getInfo = function(appid, callback){
	var wxInfoModel = mongoose.model("WxInfo", wxInfoScheam),
	    wxInfo = {},
		self = this;
	wxInfoModel.find({
		appId: appid
	}, function(err, result){
		if (result.length > 0){
			var data = result[0];

			wxInfo = {
				token: data.token,
				appId: data.appId,
				teacherId: data.teacherId
			}
			callback(wxInfo)
		}else{
			return
		}
	})
}
// 处理输入
WxModel.prototype.analysisInput = function(content, callback){
	var self = this,
		input = content.input;
	if (isType.bindClass(input)) toDo.bindClass(callback);
	if (isType.useClass(input, callback)) toDo.useClass(callback);
	if (isType.reply(input,content.teacherId)) toDo.useClass(callback);

	callback('none');
}
// 输入处理函数
var toDo = {
	bindClass: function(callback){
		// httpRequest()
	},
	useClass: function(callback){
		var reply = {
			"title": "html基础",
			"description": "html基础内容",
			"url": "https://zhishu.1njoy.com/app/#/56d54e535ed2ddf207516aab/lecture",
			"picurl": "https://zhishu.1njoy.com/app/assets/images/lang.jpg"
		}
		callback(reply)
	},
	reply: function(callback){
		saveReply(callback)
	}
}
// 分析输入内容
var isType = {
	bindClass: function(input){
		var reg = /^[0-9a-zA-Z]{6}$/;

		if (reg.test(input)) return true

		return false
	},
	useClass: function(input, callback){
		var inputKey = input.slice(0, 2);

		getList(function(list){
			if(list){
				for (var item in list){
					if (item.key == inputKey && item.isOpen){
						return true
					}else if(item.key == inputKey){
						callback("该功能暂未开启")
					}
				}
				return false
			}
			return false
		})
	},
	reply: function(input, id){
		var inputKey = input.split(":")[0];

		getReply(function(result){
			if (result){
				var keyArray = result.replyKey;
				for (var i = 0, len = keyArray.length; i < len; i++){
					if (keyArray[i] == inputKey){
						return true
					}else{
						return false
					}
				}
			}else{
				return false
			}
		})
	}
}
/*
	功能管理相关接口
	wxManageSchema: 功能基本状态信息
	wxManageClassSchema: 课表功能信息
	wxManageHomeworkSchema: 作业功能信息
	wxManageScoreSchema: 成绩功能信息
	get-wx-manage: 获取用户设置
	save-wx-manage: 保存用户设置
 */ 
var wxManageSchema = new mongoose.Schema({
	teacherId: Number,
	classId: String,
	homeworkId: String,
	scoreId: String
});
var wxManageClassSchema = new mongoose.Schema({
	isOpen: Boolean,
	key: String
});
var wxManageHomeworkSchema = new mongoose.Schema({
	isOpen: Boolean,
	key: String
});
var wxManageScoreSchema = new mongoose.Schema({
	isOpen: Boolean,
	key: String
})
// 获取公众号开放功能列表
function getList(callback){
	var wxManageModel = mongoose.model("wxmanage", wxManageSchema),
		wxManageClassModel = mongoose.model("wxmanageclass", wxManageClassSchema),
		wxManageHomeworkModel = mongoose.model("wxmanagehomework", wxManageHomeworkSchema),
		wxManageScoreModel = mongoose.model("wxmanagescore", wxManageScoreSchema),
		manageData = {
			cl: {},
			homework: {},
			score: {}
		},
		count = 1;
	function setData(index, data){
		manageData[index] = data;
		if(count == 3){
			callback(manageData)
		}else{
			count++
		}
	}
	wxManageModel.find({
		teacherId: 1
	}).exec(function(err, result){
		if(result.length > 0){
			var r = result[0];
			wxManageClassModel.find({
				_id: r.classId
			}).exec(function(err, result){
				setData('cl',result[0])
			})
			wxManageHomeworkModel.find({
				_id: r.homeworkId
			}).exec(function(err, result){
				setData('homework', result[0])
			})
			wxManageScoreModel.find({
				_id: r.scoreId
			}).exec(function(err, result){
				setData("score", result[0])
			})
		}else{
			callback()
		}
	})
}
// 获取回复key
var replyKeySchema = new mongoose.Schema({
	teacherId: Number,
	replyKey: Array
})
function getReply(id, callback){
	var replyKeyModel = mongoose.model("replykey", replyKeySchema);

	replyKeyModel.find({
		teacherId: 1
	}).exec(function(err, result){
		callback(result[0])
	})
}
// 存储reply
function saveReply(callback){
	callback("保存成功")
}
// 封装http请求
function httpRequest(method, path, data, callback){
	var option = {
		host: 'https://zhishu.1njoy.com/',
		path: 'api/v1/' + path,
		method: method,
		headers: {
			"Content-Type": 'application/json'
		}
	}
	var req = http.request(option, function(result){
		callback(result)
	})

	if (method == 'POST'){
		req.write(data)
	}

	req.end();
}

module.exports = new WxModel;