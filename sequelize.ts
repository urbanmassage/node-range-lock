import Sequelize = require('sequelize');

interface ISequelize {
  Sequelize: any; // lib
  sequelize: any; // instance
  models: any   // table models
}

/* url including uname, password & database
 */
function sequelizeConnect(url: string): ISequelize{
  let sqlOpts:any = {
    'autoMigrateOldSchema': true
  };
  if (process.env['NODE_ENV'] != 'production'){
    sqlOpts.logging = require('debug')('orm:sql')
  }
  const sequelize = new Sequelize(url, sqlOpts);

  const Lock = sequelize.define('lock', {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    key: {
      type: Sequelize.STRING,
    },
    from: {
      type: Sequelize.STRING,
    },
    to: {
      type: Sequelize.STRING,
    },
    expiry: {
      type: Sequelize.STRING,
    },
    data: {
      type: Sequelize.STRING,
    }
  }, {
    tableName: 'lock',
    timestamps: false
  });

  return {
    Sequelize,
    sequelize,
    models: {
      Lock
    }
  }
};

export default sequelizeConnect;