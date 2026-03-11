const { Model, DataTypes } = require("sequelize");

module.exports = function (sequelize) {
	class userModel extends Model { } // by ShAn
	userModel.init({
		email: DataTypes.STRING,
		name: DataTypes.STRING,
		password: DataTypes.STRING,
		facebookUserID: {
			type: DataTypes.STRING,
			defaultValue: ""
		},
		isAdmin: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
	}, {
		sequelize,
		modelName: "userDashboard"
	});

	return userModel;
};
