/// operation privleges
const PRIVILEGES={
    BASIC: {key:'BASIC', text:'基本权限', description:'拥有基本权限才能进入系统管理功能'},

    ALL: {key:'ALL', text:'所有权限', description:'拥有最高权限'},
    ///account
    ACCOUNT: {key:'ACCOUNT', text:'账号管理', description:'进行账户管理的基本权限'},
    ACCOUNT_CLIENT: {key:'ACCOUNT_CLIENT', text:'客户账户管理', description:'客户账户管理的权限'},
    ACCOUNT_OPERATION: {key:'ACCOUNT_OPERATION', text:'运营账户管理', description:'运营账户管理的权限'},
    ACCOUNT_PAY: {key:'ACCOUNT_PAY', text:'支付账户管理', description:'进行支付账户管理的基本权限'},

    /// organization
    ORGANIZATION: {key:'ORGANIZATION', text:'组织管理基本权限', description:'进行组织管理的基本权限'},

    //finance
    RECHARGE_DIRECT: {key:'RECHARGE_DIRECT', text:'账号直充', description:'线下转账的客户的账号直充'},
    RECHARGE_PROMOCODE: {key:'RECHARGE_PROMOCODE', text:'代金券充值', description:'代金券充值'},
    PROMOCODE_LIST: {key:'PROMOCODE_LIST', text:'代金券列表', description:'负责整体代金券情况查看'},
    PROMOCODE_USED_INFO: {key:'PROMOCODE_USED_INFO', text:'代金券使用详情', description:'查看代金券使用详情'},
    PROMOCODE_ADD: {key:'PROMOCODE_ADD', text:'生成代金券', description:'生成代金券'},
    PROMOCODE_UPDATE: {key:'PROMOCODE_UPDATE', text:'修改代金券', description:'修改代金券'},
    PROMOCODE_INVALID: {key:'PROMOCODE_INVALID', text:'代金券作废', description:'作废代金券'},
    PROMOCODE_EXPORT: {key:'PROMOCODE_EXPORT', text:'代金券导出', description:'代金券导出'},
    SEARCH_ACCOUNT_BALANCE: {key:'SEARCH_ACCOUNT_BALANCE', text:'搜索账户余额', description:'搜索账户余额'},

    ORDER_LIST: {key:'ORDER_LIST', text:'订单列表', description:'订单列表'},
    ORDER_EXPORT: {key:'ORDER_EXPORT', text:'订单导出', description:'订单导出'},
    BILL_LIST: {key:'BILL_LIST', text:'查看消费明细', description:'查看消费明细'},
    BILL_STATISTICS: {key:'BILL_STATISTICS', text:'月度、季度、年度的账目核算', description:'月度、季度、年度的账目核算'},

    INVOICE_LIST: {key:'INVOICE_LIST', text:'发票列表', description:'发票列表'},
    INVOICE_DETAIL: {key:'INVOICE_DETAIL', text:'查看发票详情', description:'查看发票详情'},
    INVOICE_CHECK: {key:'INVOICE_CHECK', text:'发票需求审核处理', description:'发票需求审核处理'},
    INVOICE_EXPORT: {key:'INVOICE_EXPORT', text:'导出发票', description:'导出发票'},

    USAGE_LIST: {key:'USAGE_LIST', text:'查看所有客户的用量', description:'查看所有客户的用量'},

    PRODUCT_OPERATION: {key:'PRODUCT_OPERATION', text:'商品管理', description: '商品管理的权限'},

    //workorder
    WORKORDER: {key:'WORKORDER', text:'整体工单管理', description:'整体工单管理'},
    WORKORDER_SELF: {key:'WORKORDER_SELF', text:'分配给自己的工单管理', description:'分配给自己的工单管理'},

    //support
    ENGINE: {key:'ENGINE', text:'加速盒配置管理', description:'加速盒配置管理'},
    TRANSFER_MONITOR: {key:'TRANSFER_MONITOR', text:'整体传输状态监控', description:'整体传输状态监控'},
    STORAGE: {key:'STORAGE', text:'存储管理', description:'存储管理'},




}


const ROLES={
    ACCOUNT_MANAGER: {key:'ACCOUNT_MANAGER', text:'账户管理员', description:'拥有所有权限', privileges:'ALL'},
    ORGANIZATION_MANAGER: {key:'ORGANIZATION_MANAGER', text:'组织管理员', description:'能进行组织的管理', privileges:'BASIC,ORGANIZATION,WORKORDER_SELF'},
    FINANCE_MANAGER: {key:'FINANCE_MANAGER', text:'财务管理员', description:'财务管理员', privileges:'BASIC,SEARCH_ACCOUNT_BALANCE,RECHARGE_DIRECT,' +
    'RECHARGE_PROMOCODE,PROMOCODE_LIST,ACCOUNT_PAY,INVOICE_EXPORT,ORDER_EXPORT,' +
    'PROMOCODE_USED_INFO,PROMOCODE_ADD,PROMOCODE_UPDATE,PROMOCODE_INVALID,PROMOCODE_EXPORT,ORDER_LIST,BILL_LIST,BILL_STATISTICS,INVOICE_LIST,INVOICE_DETAIL,' +
    'INVOICE_CHECK,USAGE_LIST,WORKORDER_SELF,PRODUCT_OPERATION'},
    FINANCE_ASSISTANT: {key:'FINANCE_ASSISTANT', text:'财务员', description:'财务员', privileges:'BASIC,SEARCH_ACCOUNT_BALANCE,RECHARGE_DIRECT,' +
    'RECHARGE_PROMOCODE,PROMOCODE_LIST,ACCOUNT_PAY,INVOICE_EXPORT,ORDER_EXPORT,' +
    'PROMOCODE_USED_INFO,ORDER_LIST,BILL_LIST,INVOICE_LIST,INVOICE_DETAIL,INVOICE_CHECK,USAGE_LIST,PRODUCT_OPERATION'},
    SERVICE_CUSTORMER: {key:'SERVICE_CUSTORMER', text:'客服', description:'客服', privileges:'BASIC,WORKORDER,WORKORDER_SELF,ACCOUNT,ACCOUNT_CLIENT,' +
    'ACCOUNT_PAY,ORDER_LIST,BILL_LIST,USAGE_LIST'},
    SUPPORT_TECHNIC: {key:'SUPPORT_TECHNIC', text:'技术支持', description:'技术支持', privileges:'BASIC,ACCOUNT,ACCOUNT_CLIENT,WORKORDER,WORKORDER_SELF,ENGINE'},
    SUPPORT_OPERATION: {key:'SUPPORT_OPERATION', text:'运维支持', description:'运维支持', privileges:'BASIC,WORKORDER_SELF,ENGINE,TRANSFER_MONITOR,STORAGE'},
    SALES: {key:'SALES', text:'销售', description:'销售', privileges:'BASIC'},
    SALES_MANAGER: {key:'SALES_MANAGER', text:'销售经理', description:'销售经理', privileges:'BASIC'},
    CHANNEL_VENDOR: {key:'CHANNEL_VENDOR', text:'渠道商', description:'渠道商', privileges:'BASIC'},
}


let OperationPrivileges={};

let toArray=function(o, prefix){
    var items=[];
    for(let k in o){
        let item=Object.assign({}, o[k]);
        if(prefix){
            if(k.indexOf(prefix.toUpperCase())==0){
                items.push(item);
            }
        }else{
            items.push(item);
        }
    }
    return items;
}

OperationPrivileges.listPrivileges=function(prefix){
    return toArray(PRIVILEGES, prefix);
}

//// roles=[]
OperationPrivileges.listPrivilegesByRoles=function(roles=[]){
    var privileges=[];
    roles.forEach(function(key){
        var role=OperationPrivileges.getRole(key);
        if(role && role.privileges){
            role.privileges.split(',').forEach(function(p){
                var p = OperationPrivileges.getPrivilege(p);
                if(p && !privileges.includes(p)){
                    privileges.push(p);
                }
            });
        }
    });
    return privileges.sort();
}

OperationPrivileges.listPrivilegesTextByPrivileges=function(privileges=[]){
    var privilegesText = [];
    privileges.forEach(function(key){
        var privilege = OperationPrivileges.getPrivilege(key);
        if(privilege){
            if(!privilegesText.includes(privilege.text)){
                privilegesText.push(privilege.text);
            }
        }
    });
    return privilegesText;
}

OperationPrivileges.listPrivilegesKeyByRoles=function(roles=[]){
    var privileges = OperationPrivileges.listPrivilegesByRoles(roles);
    var privilegesKey = [];
    privileges.forEach(function(key){
        privilegesKey.push(key);
    });
    return privilegesKey;
}

OperationPrivileges.getPrivilege=function(key){
    if(!key){
        return null;
    }
    var r=PRIVILEGES[key]||null;
    if(r){
        r=Object.assign({},r);
    }
    return r;
}

OperationPrivileges.listRoles=function(prefix){
    return toArray(ROLES, prefix);
}

OperationPrivileges.getRole=function(key){
    if(!key){
        return null;
    }
    var r=ROLES[key]||null;
    if(r){
        r=Object.assign({},r);
    }
    return r;
}

OperationPrivileges.getRoles=function(roles=[]){
    var roleObjs = [];
    roles.forEach(function(role){
        var roleObj = OperationPrivileges.getRole(role);
        if(roleObj){
            roleObjs.push({key: roleObj.key, text: roleObj.text});
        }
    });
    return roleObjs;
}

OperationPrivileges.getPrivilegesText = function(privileges){
    let privilegesText = [];
    for(let i = 0; i < privileges.length; i++){
        let privilege = OperationPrivileges.getPrivilege(privileges[i]);
        if(privilege) {
            privilegesText.push(privilege.text);
        }
    }
    return privilegesText.join(',');
}


module.exports=OperationPrivileges;