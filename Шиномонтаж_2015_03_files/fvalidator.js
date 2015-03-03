/**
 * Добавления собственного метода валидации

 fvalidator.setChecker( 'telephone', 'Введите номер вида "+x(xxx)xxxxxxx"' , function(obj){
	var regex = /^\+\d\([\d]{3}\)[\d]{7}$/;
	return regex.test(obj.value);
 } );

 fvalidator.register( 'form_name' , {
	'field_name': { 'telephone':true, 'msg': 'Обязательное поле в формате "+x(xxx)xxxxxxx"' },
} );

*/

if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
  }
}

if( fvalidator === undefined ){var fvalidator = function(){

	/**
	 * Фича используется для обеспечения доступа к св-вам и методам корневого this через self объект
	 * т.к. потомки 2го порядка с помощью this обращаются к своему прототипу, а не к корню
	 * к тому же можно реализовать подобие конструктора
	 */
	var self = {

		/**
         * Объекты для хранения форм и функций-валидаторов
		 */
		forms: new Object(),
		checkers: new Object(),

		/**
		 * Указатлель на объект фокусировки ( фокусирует в случае возникновения ошибки )
		 */
		focusObject: null,

		visibleError: true,

		/**
		 * Конструктор
		 * Инициализация стандартных чекеров
		 *
		 * @access private
		 *
		 * @TODO
		 */
		init: function() {

			/**
			 * Вспомогательные методы
			 */

			// Вспомогательный метод проверки корректности даты
			var check_date = function( sYear, sMonth, sDate ) {
				var dTempDate = new Date( sYear, sMonth, sDate );
				var bValid =
					( dTempDate.getFullYear() == sYear ) &&
					( dTempDate.getMonth() == sMonth ) &&
					( dTempDate.getDate() == sDate );
				return bValid;
			}

			/**
			 * Регистрация методов валидации
			 */

			// Проверка на заполнение обязательного поля
			this.setChecker( 'require', 'lang_check_nonempty', function( obj ) {
				if (!self.forms[obj.form.name].fields[obj.name].params.require) {
				   return true; // обязательность может (могла) быть убрана динамически
				}
				if ( obj.type == 'checkbox' ) {
					return obj.checked;
				}
				else if ( obj.form[obj.name + '_file'] && obj.form[ obj.name + '_file' ].type == 'file' )
					return obj.value.replace( /(^\s*)|(\s*$)/g, '' ) != '' ||
						obj.form[obj.name + '_file'].value.replace( /(^\s*)|(\s*$)/g, '' ) != '';
				else {
					return obj.value.replace( /(^\s*)|(\s*$)/g, '' ) != '';
				}
			});

			// Проверка на целое число
			this.setChecker( 'int', 'lang_check_int' , function( obj ) {
				return ( obj.value == '' ) || /^\-?\+?\d+$/.test( obj.value );
			});

			// Проверка на 6 символов (для пароля)
			this.setChecker( 'count6', 'lang_check_count6' , function( obj ) {
				return ( obj.value.length > 5 );
			});

			// Проверка на число с плавающей точкой
			this.setChecker( 'float' , 'lang_check_float', function( obj ) {
				return ( obj.value == '' ) || /^\-?\+?\d+[\.,]?\d*$/.test( obj.value );
			});

			// Проверка на e-mail
			this.setChecker( 'email' , 'lang_check_email', function( obj ) {
				obj.value = obj.value.trim();
                return ( obj.value == '' ) || /^([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)@(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})$/.test( obj.value );
			});

			// Проверка на логин
			this.setChecker( 'login' , 'lang_check_login', function( obj ) {
				return ( obj.value == '' ) || /^[A-Za-z0-9_]+$/.test( obj.value );
			});

			// Проверка на название директории
			this.setChecker( 'dirname' , 'lang_check_login', function( obj ) {
				return ( obj.value == '' ) || /^[A-Za-z0-9_\.\[\]-]+$/.test( obj.value );
			});

			// Проверка на строку из латинских букв
			this.setChecker( 'alphastring' , 'lang_check_alphastring', function( obj ) {
				return ( obj.value == '' ) || /^[A-Za-z]+$/.test( obj.value );
			});

			// Проверка на дату
			this.setChecker( 'date' , 'lang_check_date', function( obj ) {
				if ( obj.value == '' ) return true;

				var aMatches = obj.value.match( /^(\d{2})\.(\d{2})\.(\d{4})$/ );
				if ( !aMatches ) return false;

				return check_date( aMatches[3], aMatches[2] - 1, aMatches[1] );
			});

			// Проверка на время
			this.setChecker( 'time' , 'lang_check_time', function( obj ) {
				return (obj.value == '') || /^([0-1][0-9]|[2][0-3])\:[0-5][0-9]$/.test(obj.value);
			});

			// Проверка на дату/время
			this.setChecker( 'datetime' , 'lang_check_datetime', function( obj ) {
				if ( obj.value == '' ) return true;

				var aMatches = obj.value.match( /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2})\:(\d{2})$/ );

				if ( !aMatches ) return false;

				return check_date( aMatches[3], aMatches[2] - 1, aMatches[1] )
				&& /^([0-1][0-9]|[2][0-3])\:[0-5][0-9]$/.test( aMatches[4] + ':' + aMatches[5] );
			});

			// Проверка чека группы радио-баттонов
			this.setChecker( 'radio' , 'lang_check_no_variant', function( obj ) {
				var aItems = obj.form[obj.name].length ?
					obj.form[obj.name] : [ obj.form[obj.name] ];
				for ( var i = 0; i < aItems.length; i++ )
					if ( aItems[i].checked )
						return true;
				return false;
			});

			// Проверка чека группы радио-баттонов с альтернативой
			this.setChecker( 'radioalt' , 'lang_check_no_variant', function( obj ) {
				var aItems = obj.form[obj.name].length ?
					obj.form[obj.name] : [ obj.form[obj.name] ];
				for ( var i = 0; i < aItems.length; i++ )
					if ( aItems[i].checked ) {
						if ( aItems[i].value != '_alt_' )
							return true;
						else {
							if ( obj.form['alt_' + obj.name].value.replace( /(^\s*)|(\s*$)/g, '' ) != '' ) {
								return true;
							} else {
								self.setfocusObject( obj.form['alt_' + obj.name] );
								return false;
							}
						}
					}
				return false;
			});

			// Проверка чека группы чекбоксов
			this.setChecker( 'checkboxgroup' , 'lang_check_no_variant', function( obj ) {
				var aItems = obj.form[obj.name].length ?
					obj.form[obj.name] : [ obj.form[obj.name] ];
				for ( var i = 0; i < aItems.length; i++ )
					if ( aItems[i].checked )
						return true;
				return false;
			});

			// Проверка чека группы чекбоксов с альтернативой
			this.setChecker( 'checkboxgroupalt' , 'lang_check_no_variant', function( obj ) {
				var aItems = obj.form[obj.name].length ?
					obj.form[obj.name] : [ obj.form[obj.name] ];
				for ( var i = 0; i < aItems.length; i++ )
					if ( aItems[i].checked ) {
						if ( aItems[i].value != '_alt_' )
							return true;
						else {
							if ( obj.form['alt_' + obj.name].value.replace( /(^\s*)|(\s*$)/g, '' ) != '' ) {
								return true;
							} else {
								self.setfocusObject( obj.form['alt_' + obj.name] );
								return false;
							}
						}
					}
				return false;
			});

			// Проверка на регулярку
			this.setChecker( 'preg' , 'lang_check_preg', function( obj, regex ) {
				return ( obj.value == '' ) || regex.test( obj.value )
			});

			// Проверка на не соответствие регулярки
			this.setChecker( 'nopreg' , 'lang_check_nopreg', function( obj, regex ) {
//                console.log(regex);
				return ( obj.value == '' ) || !regex.test( obj.value )
			})

		},

		/**
		 * Регистрация параметров валидации полей
		 *
		 * @access public
		 *
		 * @param String form_name		Уникальное имя формы
		 * @param fields				Объект хеш-массив, содержащий объекты строк с параметрами проверок
		 */
		register: function( form_name, fields ) {

			var f = this.form(form_name)

			for( var name in fields ) {
				f.field(name).add(fields[name])
			}
		},

		/**
         * Регистрация функции - валидатора
		 *
		 * @access public
		 *
		 * @param name	имя метода-валидатора
		 * @param msg	сообщение для метода
		 * @param fn	метод валидации
		 */
		setChecker: function ( name , msg,  fn, visibleError ){
			if(visibleError !== undefined) this.visibleError = visibleError;
			this.checkers[name] = {exec: fn, msg: msg}
		},

		/**
		 * Валидация формы
		 *
		 * @access public
		 *
		 * @param mixed form	строка или объект формы
		 *
		 * @return boolean
		 */

		check: function( form ){

			// инициализируем объект для хранения ошибки
			this.error = {}

			// обнуляем объект фокус
			this.focusObject = null

			var formObj = ( typeof(form) == 'object' ) ? form : document.forms[form]

			// пробегаем по элементам формы
			for ( var i = 0; i < formObj.elements.length; i++ ) {
				var fieldObj = formObj.elements[i]
				if( !this.form(formObj.name).field(fieldObj.name).check( fieldObj ) ) {
					break
				}
			}

			// Выводим ошибку, если имеется
			if( this.haveError() ){
				this.showError()
				return false
			}

			return true
		},

		/**
		 * Устанавливаем сообщение об ошибке
		 *
		 * @param object obj	Объект поля с ошибкой
		 * @param string msg	Текст сообщения об ошибке
		 */
		setError: function( obj, msg ){
			this.error.obj = obj
			this.error.msg = msg

			this.setfocusObject(this.error.obj)
		},

		setfocusObject: function( obj ){
			if( this.focusObject === null ){
				this.focusObject = obj
			}
		},

		/**
		 * Проверяем наличие ошибки
		 *
		 * @access private
		 */
		haveError: function(){
			return (this.error.obj !== undefined) ? true : false
		},

		/**
		 * Выводим ошибку
		 * Выводим сообщение и пытаемся сделать фокус на поле с ошибкой
		 *
		 * @access private
		 */
		showError: function(){
//		    console.log(this.visibleError);
			if(this.visibleError) alert( Dictionary.translate(this.error['msg']) )
			try {this.focusObject.focus()} catch (e) {}


		},

		/**
		 * Прототип поля
		 * Предоставляет методы хранения данных поля
		 *
		 * @access private
		 */

		fieldObject: function() {

			this.params = new Object()

			// обновление параметров
			this.add = function (params){
				for( var name in params ) {
					this.params[name] = params[name]
				}
			}

			// проверка поля по установленным параметрам
			this.check = function (obj){
				for( var name in this.params ) {
					// Если данный чекер существует
					if( self.checkers[name] !== undefined ){
						// Проверяем поле
						if( !self.checkers[name].exec( obj, this.params[name] ) ){
							// устанавливаем ошибку
							var msg = ( this.params['msg'] !== undefined ) ? this.params['msg'] : self.checkers[name].msg
							self.setError( obj, msg )
							return false
						}
					}
				}

				return true;
			}
		},

		/**
		 * Прототип формы
		 * Вступает в отношения агрегации с полями
		 *
		 * @access private
		 */
		formObject: function(){

			this.fields = {}

			/**
             * Фабрика поля
			 * генерит поле, если его не существует и возвращает ссылку на него
			 */
			this.field = function(name) {

				if( this.fields[name] === undefined ){
					this.fields[name] = new self.fieldObject()
				}

				return this.fields[name]
			}
		},

		/**
		 * Фабрика формы
		 *
		 * Необходима для обращения к форме по имени
		 * генерит объект с формой, если он отсутствует
		 *
		 * @param string name		имя формы
		 * @return object			возвращает ссылку на форму
		 */
		form: function (name){

			if( this.forms[name] === undefined ){
				this.forms[name] = new self.formObject()
			}

			return this.forms[name]
		}

	}

	self.init()

	return self
}()}
