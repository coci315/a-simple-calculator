!function(){
    // 帮助函数
    // 将HTML转换为节点
    function html2node(str){
      var container = document.createElement('div');
      container.innerHTML = str;
      return container.children[0];
    }

    // 赋值属性
    // extend({a:1}, {b:1, a:2}) -> {a:1, b:1}
    function extend(o1, o2){
      for(var i in o2) if(typeof o1[i] === 'undefined'){
        o1[i] = o2[i];
      } 
      return o1;
    }


    var template = 
        '<div class="m-calculator">\
            <div class="wrapper animated">\
                <div class="header">\
                    <h3>Caculator by Link.W</h3>\
                    <span class="close">X</span>\
                </div>\
                <input class="textbox" type="text" readonly value="0">\
                <div class="buttons">\
                    <button class="button" value="AC">AC</button>\
                    <button class="button" value="CE">CE</button>\
                    <button class="button" value="%">%</button>\
                    <button class="button" value="/">/</button>\
                    <button class="button" value="7">7</button>\
                    <button class="button" value="8">8</button>\
                    <button class="button" value="9">9</button>\
                    <button class="button" value="*">*</button>\
                    <button class="button" value="4">4</button>\
                    <button class="button" value="5">5</button>\
                    <button class="button" value="6">6</button>\
                    <button class="button" value="-">-</button>\
                    <button class="button" value="1">1</button>\
                    <button class="button" value="2">2</button>\
                    <button class="button" value="3">3</button>\
                    <button class="button" value="+">+</button>\
                    <button class="button" value=".">.</button>\
                    <button class="button" value="0">0</button>\
                    <button class="button" value="Last">Last</button>\
                    <button class="button" value="=">=</button>\
                </div>\
            </div>\
        </div>';

        function Calculator(options){
            options = options || {};
            this.dom = this._layout.cloneNode(true);
            // wrapper节点，用于动画
            this.wrapper = this.dom.querySelector('.wrapper');
            // textbox节点，用于显示输入或计算结果
            this.textbox = this.dom.querySelector('.textbox');
            // 将options 复制到 组件实例上
            extend(this, options);
            this._initData();
            this._initEvent();
            return this;
        };

        extend(Calculator.prototype,{
            _layout: html2node(template),
            // 显示输入或计算结果
            displayText: function(text) {
                this.textbox.value = text;
                return this;
            },
            // 显示计算器
            show: function(){
                document.body.appendChild(this.dom);
                animateClass(this.wrapper, this.animation.enter);
                return this;
            },
            // 关闭计算器
            close: function(){
                var that = this;
                animateClass(this.wrapper, this.animation.leave, function(){
                    document.body.removeChild(that.dom);
                });
            },
            // 补零
            toZero: function(str) {
                // 如果第一位是小数点，在小数点前面补零
                if(/[\+\*\/\%\.]/.test(str.charAt(0))) {
                    return '0'+str;
                }else {
                    // 如果字符串为空，用零替换，否则返回原字符串
                    return str === '' ? '0' : str;
                }
            },
            // 删去字符串起始的0，会导致小数点前面的0也被删除，所以toZero函数里对小数点做了补零处理
            trimZero: function(str) {
                return str.replace(/^0+/g,'');
            },
            // 初始化数据
            _initData: function() {
                // 存储表达式字符串
                this.exp = '0';
                // 存储计算结果
                this.results = [];
                // 存储results数组的下标
                this.index = 0;
                // 标志位，用来判断是否对输入的数字进行替换
                this.clear = false;
            },
            // 初始化事件
            _initEvent: function(){
                var that = this;
                // 关闭按钮注册点击事件，点击时关闭计算器
                this.dom.querySelector('.close').addEventListener('click',this.close.bind(this),false);
                // 在buttons节点上代理button节点的点击事件
                this.dom.querySelector('.buttons').addEventListener('click',function(event){
                    event = window.event || event;
                    var target = event.target || event.srcElement;
                    if(target.tagName.toLowerCase() == 'button') {
                        var text = target.value;
                        // 如果点击的按钮是数字或者小数点或者运算符
                        if(parseInt(text) == text || /[\+\-\*\/\%\.]/.test(text)) {
                            // 防止输入多个小数点
                            if(text === '.') {
                                if(that.exp.indexOf('.') != -1) {
                                    return;
                                }
                            }
                            // 防止一次输入多个运算符
                            if(/[\+\-\*\/\%]/.test(text)) {
                                if(/[\+\-\*\/\%\.]$/.test(that.exp)) {
                                    that.exp = that.exp.slice(0,-1);
                                }
                            }
                            // 屏幕上为上一次计算结果时，如果继续输入数字，就清空之前的结果，如果输入运算符，则在上次的结果后继续计算
                            if(that.clear === true && parseInt(text) == text) {
                                that.exp = text;
                            } else {
                                that.exp += text;
                            }
                            // 标志位重新取为false
                            that.clear = false;
                        } else if(text === 'AC') {
                            that.exp = '';
                            
                        } else if(text === 'CE') {
                            that.exp = that.exp.slice(0,-1);
                        } else if(text === '=') {
                            if(/[\+\-\*\/\%]/.test(that.exp.charAt(that.exp.length-1))) {
                                return;
                            }
                            var result = '' + eval(that.exp);
                            that.exp = result;
                            that.results.push(result);
                            that.index = that.results.length - 1;
                            that.clear = true;
                        } else if(text === 'Last') {
                            if(that.results.length > 0) {
                                if(that.results[that.index] != undefined) {
                                    that.exp = that.results[that.index];
                                    that.index--;
                                    if(that.index < 0){
                                        that.index = that.results.length - 1;
                                    }
                                }
                            }
                        }
                        that.exp = that.trimZero(that.exp);
                        that.exp = that.toZero(that.exp);
                        that.displayText(that.exp);
                    }
                })
            }

        });


        window.Calculator = Calculator;
}();