if(!Array.indexOf){
    Array.prototype.indexOf = function(obj){
        for(var i=0; i<this.length; i++){
            if(this[i]==obj){
                return i;
            }
        }
        return -1;
    }
}
var service_charge_enabled, service_charge;

// Получить GET-параметры в виде объекта {param: value, ...}
var getQueryParams = function() {
    var r = {};
    var q = location.search.substr(1);
    var qPairs = q.split('&');
    for (var i = 0, len = qPairs.length; i < len; i++) {
        var qParams = qPairs[i].split('=');
        r[decodeURIComponent(qParams[0])] = decodeURIComponent(qParams[1]);
    }
    return r;
};

var bulkypickup = 0;

// PLUGINS ----------------------------------------------------------------------------------------------------------------
(function($){

    // TOGGLE INPUT - заменяет описание в input
    // Для инициализации: $('input').toggleInput()
    // По дефолту цвет вписываемого цвета #000, если необходимо сменить цвет используйте $('input').toggleInput({color:'#цвет'})
    $.fn.toggleInput = function(options){
        var settings = $.extend({
                                    color: '#000',
                                    password: false,
                                    onFocus: null,
                                    onBlur: null,
                                    onInit: null,
                                    onChange: null
                                }, options);

        this.each(function(){
            var
                s = $(this),
                preVal = s.val(),
                color = s.css('color');

            if( typeof settings.onInit == 'function' ) settings.onInit(s);

            s.bind('focus', function(){
                if( typeof settings.onFocus == 'function' ) settings.onFocus(s);
                if(s.val() == preVal){
                    s.val('').css('color', settings.color ? settings.color : color);
                    if( settings.password ){
                        var passInput = s.clone(true);
                        passInput.attr('type','password');
                        s.replaceWith(passInput);
                        s = passInput;
                        s.focus();
                    }
                }
            });

            s.bind('blur', function(){
                if( typeof settings.onBlur == 'function' ) settings.onBlur(s);
                if(s.val() == ''){
                    s.css('color', color);
                    if( settings.password ){
                        var passInput = s.clone(true);
                        passInput.attr('type','text');
                        s.replaceWith(passInput);
                        s = passInput;
                    }
                }
                s.val( s.val() == '' ? preVal : s.val() );
            });

            if( typeof settings.onChange == 'function' )
                s.bind('change, keyup', function(){
                    settings.onChange(s);
                });

        });
    };


    // всплывающие подсказки
    $.fn.hint = function(options){
        var settings = $.extend({
                                    speed: 180,
                                    margin: 10
                                }, options);

        this.each(function(){
            var
                s = $(this),
                sH = $('div.sHint', s),
                sTop = parseInt(sH.css('top')),
                nTop = sTop + settings.margin;

            sH.css('top', nTop);
            s.bind({
                       mouseenter: function(){
                           sH.show().stop(true, true).animate({top: sTop, opacity: 1}, settings.speed);
                       },
                       mouseleave: function(){
                           sH.hide().stop(true, true).animate({top: nTop, opacity: 0}, settings.speed);
                       }
                   });

        });
    };



    $.fn.piuAnimate = function(options){
        var $piu = $('<div class="piu"></div>');
        var o = $.extend({
                             item: null,
                             speed: 600,
                             easing: 'backout'
                         }, options);

        if( o.item != null )
            this.each(function(){
                var
                    s = $(this),
                    piu = $piu.clone(),
                    el = $(o.item, s),
                    el0 = el.filter(function(){ return $(this).hasClass('active') });

                s.append(piu);

                if( el0.length != 0 )
                    piu.css({width: el0[0].offsetWidth, left: el0[0].offsetLeft});

                s.bind({
                           mouseleave: function(){
                               el0.length != 0 ? movePiu( el0[0] ) : movePiu( null );
                           }
                       });
                el.hover(function() {
                    movePiu(this);
                });
                function movePiu(el) {
                    piu.dequeue().animate({
                                              width: el != null ? el.offsetWidth : 0,
                                              left: el != null ? el.offsetLeft : 0
                                          }, o.speed, o.easing);
                };
            });

    }


})( jQuery );


//------------------------------------------------------------------------------------------------------------------------
var numeralMonths = {
    1 : 'января',
    2 : 'февраля',
    3 : 'марта',
    4 : 'апреля',
    5 : 'мая',
    6 : 'июня',
    7 : 'июля',
    8 : 'августа',
    9 : 'сентября',
    10 : 'октября',
    11 : 'ноября',
    12 : 'декабря'
};

var onlyNumbers = function(obj){
    if( $(obj).val() != '' ){
        if( (/^\s*\d+\s*$/).test( $(obj).val() ) )
            $(obj).attr('data-value', $(obj).val());
        else
            $(obj).val( $(obj).attr('data-value') );
    }else{
        $(obj).attr('data-value', '');
    }
};

function validateEmail(mail){
    if( (/^[+A-Za-z0-9_\.-]+@[+A-Za-z0-9_\.-]+\.[A-Za-z]{2,}$/).test( mail ) )
        return true;
    else
        return false;
}


Number.prototype.formatMoney = function(c, d, t){
    var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

function check_properties(is_alert) {
    var is_alert = is_alert || ( is_alert == false ? false : true );
    var error = [];
    var data = [];
    $('.variationprop').each(function(){
        if( !$(this).data('selected') ) error.push( ($(this).data('properties'))[0].name );
    });
    if( error.length > 0 ) {
        if(is_alert) {
            //alert( "Не выбраны поля: " + error.join(', ') );
            data['error_message'] = "Не выбраны поля: " + error.join(', ');
        }
        if(is_alert && data['error_message'].length > 3) {
            $(Cart).trigger('Cart.errorRequest', [data.error_message, data]);
        }
        return false;
    }
    return true;
};

function get_param_add_to_totalcost(data) {
    if (data && data.allcount > 0) {
        for (var i in data.cart) {
            if (data.cart[i]['add_to_total_cost'] > 0) {
                return data.cart[i]['add_to_total_cost'];
            }
        }
    }
    return 0;
}

$(function(){
    $('#cart-add').click(function(){
        var count = $('div#count_item_btn div.count_num').html();
        if( check_properties() ){
            flyToCart( $(this), function(){
//                _gaq.push(['_trackEvent', 'basket', 'goods', 'add']);
                dataLayer.push({
                    'GAEventCategory': 'basket',
                    'GAEventAction': 'goods',
                    'GAEventLabel': 'add',
                    'event': 'GAEvent'
                });
            }, true, count );
        }
        return false;
    });
});

//LAST WORDS - NUMERAL

function numeral($number, $ending1, $ending2, $ending3) {
    //"продукт", "продукта", "продуктов"
    $num100 = $number % 100;
    $num10 = $number % 10;

    if ($num100 >= 5 && $num100 <= 20 || $num10 == 0 || ($num10 >= 5 && $num10 <= 9)) {
        return $ending3;
    }else if ($num10 == 1){
        return $ending1;
    }else{
        return $ending2;
    }
}

function delivery_type_check_radio(is_change){
    var el = $('input:radio[name=COURIER_TYPE_ID_4]').eq( Cart.cookie.delivery_type );
    el.attr('checked',true);
    if(is_change)
        el.change();
};



//PARSER ULR

function parse_url(url){
    if (url.indexOf('/?') == 0){
        url = url.replace('/?', '');
        url = url.split('&');
        var link = new Object;
        var pair;
        for (pair in url){
            pair=url[pair].split('=');
            link[pair[0]]=pair[1];
        }
        return link;
    } else {
        return false;
    }
};

var gup = function( name ){
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( window.location.href );
    if( results == null )
        return "";
    else
        return results[1];
};


//MAIN PAGE -->  TOP BLOCK -->   CART

var goLightbox = function(obj){
    $(obj).lightBox({
                        imageLoading: 'http://st.biglion.ru/general/v3/img/lightbox/lightbox-ico-loading.gif',
                        imageBtnPrev: 'http://st.biglion.ru/general/v3/img/lightbox/lightbox-btn-prev.gif',
                        imageBtnNext: 'http://st.biglion.ru/general/v3/img/lightbox/lightbox-btn-next.gif',
                        imageBtnClose: 'http://st.biglion.ru/general/v3/img/lightbox/lightbox-btn-close.gif',
                        imageBlank: 'http://st.biglion.ru/general/v3/img/lightbox/lightbox-blank.gif',
                        txtImage: 'фото',
                        txtOf: 'из'
                    });
}


//MAIN PAGE -->  TOP BLOCK -->   CART

var CartHandler;
var addToCartClicked = false;
function flyToCart(obj, callback, add, count){
    if(add)
    {
        var client_id = getCookie('client_id');
        /*if (typeof client_id == 'undefined') {
         window.location.href = '/auth/';

         return;
         }*/

        addToCartClicked = true;
        Cart.add({
                     product_id_4: $(obj).attr('data-product-id'),
                     product_count_4: count,
                     product_price_4: $(obj).attr('data-price-id')
                 });
    }

    if( typeof callback == 'function' ){
        callback();
	    $(document).trigger('Cart.flyToCart');
    }
};

if (!Object.keys) {
    Object.keys = (function () {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function (obj) {
            if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }());
}

var Cart = new (function(){
    var self = this;
    this._deffered = {};
    this.cookie = $.extend({
                               delivery_type: 0,
                               kladrcode: null,         //null city
                               courier_region: 0,
                               name: '',
                               surname: '',
                               patronymic: '',
                               address: '',
                               phone: ''
                           }, JSON.parse(getCookie('cart_data') ? getCookie('cart_data') : "{}"));
    this.urls = {
        add : '/r/cart/?action_4=add',
        del : '/r/cart/?action_4=del',
        count : '/r/cart/?action_4=count',
        get : '/r/cart/?action_4=get'
    };

    $(this).on('Cart.googleAnalytics', function(e, context){
        $('a.order_page', context).parent().on('click', function(){
//            _gaq.push(['_trackEvent', 'order', 'goods', 'button_click']);
            dataLayer.push({
                'GAEventCategory': 'order',
                'GAEventAction': 'goods',
                'GAEventLabel': 'button_click',
                'event': 'GAEvent'
            });
        });

    });

    this.cartLoader = $('');
    //this.errorPopup = $('<div class="ajaxerror"><p></p></div>');
    this.errorPopup = $('<div id="furniture-dialog"><div class="furniture-you-try"></div><div class="furniture-caution"><div></div><p></p></div><div class="furniture-error"></div><div class="furniture-footer"><div class="furniture-footer-notify">Сожалеем о доставленных неудобствах.</div><div class="button_more">Ok</div></div></div>')
    this.furnitureerrorPopup = $('<div id="furniture-dialog"><div class="furniture-you-try"> <p>Вы пытаетесь добавить в корзину:</p><span id="firsterror"></span></div><div class="furniture-caution"><div></div>Данный товар невозможно доставить одновременно с</div><div class="furniture-error"><span id="seconderror"></span></div><div class="furniture-footer"><div class="furniture-footer-notify">Сожалеем о доставленных неудобствах.<br>Данные товары можно заказать отдельно.</div><div class="button_more">Ok</div></div></div>');
    this.promptPopup = $('<div id="furniture-dialog"><div class="furniture-you-try"></div><div class="furniture-caution"><div></div><p></p></div><div class="furniture-error"></div><div class="furniture-footer"><div class="furniture-footer-notify">&nbsp;</div><div id="0" class="button_more">Нет</div><div id="1" class="button_more">Да</div></div></div>')
    this.cartErrorCodes = {
        1000: 'Недостаточно товара на складе',
        1001: 'Ошибка передачи данных',
        1002: 'Нет такого товара в корзине',
        1005: 'Доставка выбранных вами позиций в данный регион не осуществляется',
        1006: 'Не заполнены обязательные поля',
        1007: 'Пользователь не найден',
        1008: 'Ошибка создания заказа',
        1009: 'Ошибка создания заказа',
        1010: 'Ошибка оплаты с баланса',
        1011: 'Предложение завершено',
        1012: 'Возможна покупка только одного товара данного наименования',
        1013: 'Для данного населенного пункта выбор улицы из списка обязателен',
        '0001': 'Некорректное кол-во товара',
        '0002': 'Недостаточное кол-во товара на складе',
        '0003': 'Поле "Населенный пункт" должно быть выбрано из предложенных Вам вариантов',
        //1014 : 'К сожалению, доставка крупногабаритного товара возможна только курьером по Москве и Московской области в пределах 40 км от МКАД',
        1014 : 'Доставка крупногабаритного товара возможна только курьером по Москве и МО в пределах 40 км от МКАД',
        1015: 'Выберите способ доставки',
        1016 : 'К сожалению, товар не может быть доставлен в данный регион',
        1017 : 'К сожалению, общий вес заказа больше 15кг, что не позволяет воспользоваться Самовывозом',
        1018 : 'Длина Имени или Фамилии более 128 символов',
        1019 : 'Длина номера телефона должна быть 10 символов',
        1020 : 'Общий вес заказа больше 15кг, что не позволяет воспользоваться Самовывозом. Вернитесь на страницу "<a href="/cart/?action_4=order">Оформление заказа</a>" и заполните данные для доставки курьером</span> ',
        1021 : 'Вы пытаетесь добавить в корзину товары разных категорий',
        1022 : 'Для доставки необходимо ввести номер мобильного телефона',
        1023 : 'Заполните поле Город',
        1024 : 'Доставка данным способом не осуществляется',
        1025 : 'Выберите способ оплаты',
        1100 : 'Нельзя использовать этот промокод для оплаты данного заказа', // отображается сообщение из data.error_message
        1101 : 'Нельзя использовать этот промокод для оплаты данного заказа', // отображается сообщение из data.error_message
        2000 : 'Выберите условия доставки',
        2001 : 'Заполните поле Этаж',
        2002 : 'Выберите условия доставки до квартиры',
        1103 : 'Проверьте Промокод',
        1104 : 'С промокодом biglion25 возможна доставка либо Qiwi Post, либо курьерская доставка'

    };

    $(this).on('Cart.setCookie', function(e, obj){
        this.cookie = $.extend(this.cookie, obj);
        deleteCookie('cart_data');
        setCookie('cart_data', JSON.stringify( this.cookie ), {expires: 0, domain: '.biglion.ru'});
    });

    var cartHTML = {
        wrap: '<table class="items_block" border="0" cellpadding="0" cellspacing="0"></table>',
        line: '<tr></tr>',
        productline: '<td><div class="rel_path"><div class="item_hover_img"></div><img src="%thumb_image%" border="0" /></div></td><td><a href="#">%title%</a><p>%description%</p></td><td>с %delivery_date%</td><td>%quantity%</td><td><b>%price%</b> руб</td><td><div class="rel_path"><div class="close"></div></div></td>',
        head: '<tr><td></td><td class="item_name"><div>Наименование</div></td><td class="date"><div>Дата доставки</div></td><td class="count"><div>Кол-во</div></td><td class="price"><div>Цена</div></td><td class="close"><div>Удалить</div></td></tr>',
        foot: '',
        prefoot: ''
    };

    this.changeHTML = function(){
        if( typeof arguments[0] === "object" ) for(var i in arguments[0]){
            if( cartHTML[i] !== null ) cartHTML[i] = arguments[0][i];
        }
    };

    var self = this;
    var getData = function(i, params, callback){
        var params = params || {};
        if(!self.urls[i]) return false;

        params.events = params.events == undefined ? true : params.events;
        params._t = +(new Date());
        $(Cart).trigger('Cart.startRequest');
        $.ajax(
            {
                url: self.urls[i],
                dataType: 'json',
                type: 'GET',
                data: params,
                success: function(data){
                    if(data.success) {
                        var add_to_total_cost = get_param_add_to_totalcost(data);
                        if (add_to_total_cost > 0) data.totalcost += add_to_total_cost;

                        $(Cart).data('orders', data);
                        if(params.events) {
                            self.getHTML(data);
                            if(params.mini)
                                $('#cart_popup').remove();
                        }
                        if (params.promocode) {
                            load_delivery();
                        }
                        else {
                            $(Cart).trigger('Cart.endRequest');
                            if(typeof callback == 'function'){
                                callback(data);
                            }
                        }

                    }
                    if(data.error) $(Cart).trigger('Cart.errorRequest', [data.error, data]);
                }
            }
        );
    };

    this.getHTML = function(data, html, event){
        /* применить промокод */
        var use_promo = $(document).data('use_promo');
        var promo_type = $(document).data('promo_type');
        var promocode_discount = $(document).data('promo_discount');
        /* применить промокод */
        var wrap = (html && html.wrap) ? html.wrap : cartHTML.wrap;
        var head = (html && html.head) ? html.head : cartHTML.head;
        var prefoot = (html && html.prefoot) ? html.prefoot : cartHTML.prefoot;
        var foot = (html && html.foot) ? html.foot : cartHTML.foot;
        if (data && !data.delivery) { foot = foot.replace('%delivery%',0);}

        if( data.allcount > 0 ) {

            var lines = $("<div></div>").addClass("lines");

            var plannedDates = [],
                datesCounter = 0,
                showWarning = false,
                showWarningBigWeight = false,
                block_count = 0,
                hide_ids = [],
                promo_discount = 0;

            for(var i in data.cart) {
                var line = (html && html.line) ? html.line : cartHTML.line;
                var productline = (html && html.productline) ? html.productline : cartHTML.productline;

                if (data.cart[i]['big_weight']) {
                    block_count++;
                }

                for(var param in data.cart[i]){
                    var re = new RegExp('\%'+param+'\%', 'g');
                    head = head.replace(re, data.cart[i][param]);
                    line = line.replace(re, data.cart[i][param]);
                    productline = productline.replace(re, data.cart[i][param]);
                    if (data.cart[i]['big_weight']==1) {
                        data.cart[i]['planned_date_text'] = 'Согласовывается при подтверждении заказа';
                        showWarningBigWeight = true;
                    }
                    if (data.cart[i]['show_price_text']){
                        //data.cart[i]['price'] = "Подарок";
                        data.cart[i]['price'] = data.cart[i]['show_price_text'];
                        var idd = data.cart[i]['id'];
                        hide_ids.push(idd);
                    }

                    if (data.cart[i]['promo'] && data.cart[i]['promo'] == "PROMO_PRODUCT_PRESENT_CATEGORY"){
                        data.show_present_block = false;
                    }

                    if (data.cart[i]['promo_product_present_category']){
                        data.show_present_block = false;
                    }

                    if (param == 'price_copy'&& use_promo) {
                        promo_discount += ( parseInt(data.cart[i]['price']) - parseInt(data.cart[i]['price_copy']) ) * data.cart[i]['quantity'];
                    }

                    prefoot = prefoot.replace(re, data.cart[i][param]);
                    foot = foot.replace(re, data.cart[i][param]);
                    foot = foot.replace('%cost%', data.totalcost);
                }
                if (data.cart[i]['unbind'] == true) {
                    productline = productline.replace("number_units", "number_units__");
                    productline = productline.replace("hproduct", "hproduct__");
                    productline = productline.replace("close_item", "close_item unbind");

                    // нужны все 4 замены!!
                    productline = productline.replace("data-id", "data__id__");
                    productline = productline.replace("data-id", "data__id__");
                    productline = productline.replace("data-id", "data__id__");
                    productline = productline.replace("data-id", "data__id__");
                }
                lines = lines.append( $(line).append( productline ) );

                for (var key in hide_ids) {
                    // вызывает ошибку на странице экспресс-акций, отзывов
                    var regex1 = /express/;
                    var regex2 = /review/;
                    if (!regex1.test(document.location.href) && !regex2.test(document.location.href)) {
                        $('#cursm'+hide_ids[key],lines).remove();
                    }
                }

                plannedDates[datesCounter] = data.cart[i]["planned_date"][5];
                datesCounter = datesCounter + 1;

                //console.log("render cart",data.show_present_block);
                if (data.show_present_block) {
                    get_gift_data();
                } else {
                    $('#gift-box').hide();
                }
            }
            wrap = $(wrap).append(lines);

            foot = foot.replace('%delivery%',0); // фикс бага, при котором не выставляется цена доставки

        }

        if ( (Object.keys(data.cart).length == block_count && showWarningBigWeight) ) {
            $('.curent_time_bl').html('<span></span>');

            data.planned_date = 'Согласовывается при подтверждении заказа';

            var cart_url = /cart/;
            if ( cart_url.test(document.location.href) ) {
                clearDeliveryDate(false);
            }

            $('.link_changeDate').hide();



                $('.curent_time_bl').html('<span>'+data.planned_date+'</span>');


        } else {
            var q = jQuery.data(document.body, "quotas");
            if (undefined != q ) {
                $('.link_changeDate').show();
            }

            //$('.curent_time_bl').html('Ближайшая: <span class="date_bl"></span>');

        }

            for ( i in plannedDates ) {
            if ( plannedDates[0] != plannedDates[i] && plannedDates.length > 1 ) {showWarning = true; break;}
        }


        wrap = $(wrap).prepend( head );
        wrap = $(wrap).append( prefoot );
        wrap = $(wrap).append( foot );

        if (    ($('#delivery_date_text',wrap).length > 0 && (city_ids.indexOf(city_id) != -1) ) ) {
            var dat = $('#delivery_date_text b',wrap).html();
            $('#delivery_date_text',wrap).html("Дата доставки: <b>"+dat+"</b>");
        }

	    if ($('.curent_time_bl').length > 0 ) {
		    $('.service_charge',wrap).html(service_charge ? service_charge : 0);
		    $('.service_charge').html(service_charge ? service_charge : 0);
	    }

	    if (promo_type != 3 && promocode_discount){
            promo_discount = promocode_discount;
        }
        if (3 == promo_type){
            $('.s-result .s-sum',wrap).text(data.totalcost - promo_discount);
        }

        $("span.promocode-discount", wrap).text(promo_discount);
        $("span.promocode-discount").text(promo_discount);

        if (undefined !==jQuery.data(document.body, "bpn")) {
            $('.bonus_program_number',wrap).val(jQuery.data(document.body, "bpn"));

        }

        $(document).data('promo_discount', promo_discount);
        if (use_promo) {
            $("div.s-totalDiscount", wrap).show();
            var reduce_delivery = 0;
            load_delivery();
            var promo_info = $(document).data("promo_info");
            $('.s-result.cost span',wrap).text(promo_info.order_price);
            $('.s-result.cost span').text(promo_info.order_price);
            $('.s-total.s-totalDiscount span',wrap).text(promo_info.promo_discount);
            $('.s-total.s-totalDiscount span').text(promo_info.promo_discount);
            // если у клиента был неоформленный заказ с доставкой, то для нового захода в корзину вычитаем  цену доставки

            if (typeof is_new != 'undefined' && true == is_new) {
                reduce_delivery = promo_info.delivery_price;
            }
            $('.s-total.fullcost span',wrap).text(promo_info.need_to_pay - reduce_delivery);
            $('.s-total.fullcost span').text(promo_info.need_to_pay - reduce_delivery);

            event = true;
        }

        if ( !showWarning ) $('.warning-planned-date', wrap).remove();
        if ( !showWarningBigWeight ) $('.warning-planned-date-big-weight', wrap).remove();

        if(!event) {
            $(Cart).trigger('Cart.getHTML', [data, $(wrap)] );
            $(Cart).trigger('Cart.endRequest');


        } else {
            return $(wrap);
        }
    };

    for(var i in this.urls){
        (function(i){
            self[i] = function(){
                var params, callback;
                if( arguments.length == 1 ){
                    if( typeof arguments[0] === 'function' ){
                        params = null;
                        callback = arguments[0];
                    } else if( typeof arguments[0] === 'object' ){
                        params = arguments[0];
                    }
                } else if( arguments.length == 2 ){
                    params = arguments[0];
                    callback = arguments[1];
                }
                getData(i, params, callback);
            }
        })(i);
    }


    $(this).bind('Cart.errorRequest', function (e, code, data) {

        $("body").on("click", ".ui-widget-overlay", function () {
            $('#furniture-dialog').dialog('close');
        });

        if (code == 1011) {
            if (data.id) Cart.del({cart_item_id_4: data.id });
        }

        if (code == 2003) {
            var error_data = data.category_error.split('_spliter_');
            $('span[id="firsterror"]', self.furnitureerrorPopup).html(error_data[0]);
            $('span[id="seconderror"]', self.furnitureerrorPopup).html(error_data[1]);
            $(self.furnitureerrorPopup).dialog({closeText: "Закрыть", width: 420, title: 'Ошибка оформления заказа', modal: true, resizable: false,
                create: function () {
                    $('#furniture-dialog .button_more').on('click', function () {
                        $('#furniture-dialog').dialog('close');
                    });
                },
                close: function () {
                    $(this).remove();
                }

            });
        } else {
            if (data && data.error_message) {
                $('p', self.errorPopup).html(data.error_message);
            } else {
                $('p', self.errorPopup).html(self.cartErrorCodes[code]);
            }
            if ($('body div.furniture-caution').length == 0)
                $('body').append(self.errorPopup);
            $(self.errorPopup).dialog('option', 'position', 'center');
            $(self.errorPopup).dialog({ closeText: "Закрыть", width: 420, title: 'Ошибка', modal: true, resizable: false,
                create: function () {
                    $('#furniture-dialog .button_more').on('click', function () {
                        $('#furniture-dialog').dialog('close');
                    });
                },
                open: function(){
                    $('div.ui-widget-overlay').last().addClass("error_close");
                },
                close: function () {
                    $('div#submitFullForm').css('opacity', '1');
                    //$('div.ui-widget-overlay').last().remove();
                    $('.error_close').remove();
                    $(this).remove();
                }
        });
        }
    });

    $(this).bind('Cart.promptRequest', function (e, prompt_message, yes_callback, no_callback) {
        $('p', self.promptPopup).html(prompt_message);
        $(self.promptPopup).dialog({ closeText: "Закрыть", width: 420, title: '', modal: true, resizable: false,
            create: function () {
                $('#furniture-dialog .button_more').on('click', function () {
                    if ( (1 == $(this).attr("id")) && typeof yes_callback == 'function'){
                        yes_callback();
                    }
                    if ( (0 == $(this).attr("id")) && typeof no_callback == 'function'){
                        no_callback();
                    }
                    $('#furniture-dialog').dialog('close');
                });
            },
            close: function () {
                $(this).remove();
            }
        });

    });

})();


Cart.counterInput = function(id, html){
    var countTimer;
    $(id, html).each(function(i, el){
        $(el).data( 'count', $(el).val() );
        $(this).bind('keyup change', function(e){
            var remCount = parseInt( $(el).attr('data-rem-count') );
            clearTimeout(countTimer);
            switch(e.type) {
                case 'keyup':
                    if( isNaN(parseInt($(el).val())) || /(\D+)/.test($(el).val()) ) {
                        countTimer = setTimeout(function(){
                            $(Cart).trigger( 'Cart.errorRequest', ['0001'] );
                            $(el).val( $(el).data( 'count') );
                        }, 500);
                        return false;
                    }
                    if( $(el).data( 'count' ) != $(el).val() ) {
                        if( e.keyCode == 13 ) $(el).change();
                        countTimer = setTimeout(function(){
                            $(el).change();
                        }, 500);
                    }
                    break;
                case 'change':
                    if( (""+Math.abs($(el).val())).split('').length <= 2 && parseInt($(el).val()) >= 0 ) {
                        if( remCount >= $(el).val() || remCount == -1 ) {
                            var ids = $(el).attr('data-id').split('_');
                            Cart.count( {product_id_4: ids[0], product_price_4: ids[1], product_count_4: $(el).val()} );
                            $(el).data( 'count', $(el).val() );
                        } else {
                            $(Cart).trigger( 'Cart.errorRequest', ['0002'] );
                            $(el).val( $(el).data( 'count') );
                        }
                    }
                    break;
            }
        });
    });
};

Cart.counterInputPlusMinus = function(id, html){
    var countTimer;
    $(id, html).each(function(i, el){
        $(el).data('count', $(el).val());
        var remCount = parseInt( $(el).attr('data-rem-count') );
        if( remCount >= $(el).val() || remCount == -1 ) {
            var ids = $(el).attr('data-id').split('_');
            Cart.count( {
                            product_id_4: ids[0],
                            product_price_4: ids[1],
                            product_count_4: $(el).val()}
            );
            $(el).data( 'count', $(el).val() );
        } else {
            $(Cart).trigger( 'Cart.errorRequest', ['0002'] );
            $(el).val( $(el).data( 'count') );
        }
        //}
    });
};


Cart.topInit = function(){
    HTML = {
        wrap: '<div class="basket radius_0_0_4_4"></div>',
        line: '<div class="info"></div>',
        productline: '<div class="img"><img src="%thumb_image%" alt="pic"></div>\
                        <div class="name"><a href="%url%">%title%</a></div>\
                        <div data-id="%id%" class="delete-mini"><div class="icon_delete"> &times; </div></div>\
                        <div class="clear"></div>',

        head: '<div class="header">\
                            <div class="title">Наименование</div>\
                        </div><div class="clear"></div>',
        foot: '<div class="sum">\
                            Итого: <span>0</span>.-\
                        </div>\
                        <div class="clear"></div>\
                        <div class="registration">\
                            <a href="/cart/?action_4=order" class="order_page flat-btn orange huge" style="font-weight: bold; float: right;">ОФОРМИТЬ ЗАКАЗ</a>\
                            <!--a href="#" class="continue">Продолжить покупки</a-->\
                            <div class="clear"></div>\
                        </div>\
                    <div class="clear"></div>',
        display_rows: 3
    };

    popupHTML = {   ////////////////////////////////////////
        wrap: '<div class="basket radius_0_0_4_4"></div>',
        line: '<div class="info"></div>',
        productline: '<div class="img"><img src="%thumb_image%" alt="pic"></div>\
                        <div class="name" style="width: 337px;"><a href="%url%">%title%</a></div>\
                        <div class="value" style="width: 110px;">\
                            <div class="choose_count" data-id="%id%">\
                                <div class="pm_product number_units" style="margin-left:25px;top:-7px;">\
                                <div id="minus" class="minus" data-step="-1">&minus;</div>\
                                <input class="totalqnt" data-rem-count="%rem_count%" data-id="%id%" value="%quantity%" maxlength="2" readonly="readonly">\
                                <div id="plus" class="plus" data-step="1">+</div>\
                                </div>\
                            </div>\
                        </div>\
                        <div style="width: 155px; " data-id="%id%" class="price"><strong>%price%</strong><span id="cursm%id%">.-</span></div>\
                        <div style="width: 27px;" data-id="%id%" class="delete bsk_btn_delete"><div class="icon_delete"> &times; </div></div>\
                        <div class="clear"></div>',
        head: '<div style="color: #333;" class="header">\
                            <div style="height: 35px; line-height: 35px; width: 466px;" class="title">Наименование</div>\
                            <div style="height: 35px; line-height: 35px; width: 115px;" class="value">Количество</div>\
                            <div style="height: 35px; line-height: 35px; width: 115px;" class="price">Цена</div>\
                            <div style="height: 35px; line-height: 35px; width: 75px;" class="delete">Удалить</div>\
                        </div><div class="clear"></div>',
        foot: '<span id="delivery_date_text" style="position: absolute; top: 106%; width: 330px;">Срок передачи в службу доставки: <b>%planned_date_text%</b></span><div class="product_present_text" style="background: #628eff; color: #fff; font-size: 16px; line-height: 22px; text-align: center; padding: 5px 0; display: none;"><img align="absmiddle" src="http://st.biglion.ru/v3/img/promo/gift_marker.png">&nbsp;&nbsp;&nbsp;<span></span></div><div class="promo_1rub_text" style="color: red; font-weight: bold; display:none;">Внимание! Общее количество по данной позиции не может превышать 1 шт.</div><div class="buy_more_present" style="color: red; font-weight: bold; display:none;">Вы можете получить товар в подарок! <a href="/presents/" style="color:#22a0e0;">Подробнее</a></div><div class="buy_more" style="color: red; font-weight: bold; display:none;">Закажите товаров еще на <span></span> рублей, и доставка будет бесплатной. <a href="/goods_free_shipping/" style="color:#22a0e0;">Подробнее</a></div><div style="padding: 10px 10px 20px; font-size: 14px;" class="warning-planned-date"><span style="color:red;">Обратите внимание</span>, что в Вашем заказе есть товары с разными датами передачи в службу доставки.<br>Если Вы хотите получить товар(ы) максимально быстро, Вы можете разделить заказ.</div>\n\
				<div style="padding: 10px 10px 20px; font-size: 14px;" class="warning-planned-date-big-weight"><span style="color:red;">Обратите внимание</span> В корзине находится крупногабаритный товар, доставка которого осуществляется<br> только по Москве.</div><div class="sum">\
						<div class="sum">Итого: <span style="width: 80px; display: inline-block;">0</span>.-</div>\
						<div class="dis" style="float: right;width: 731px;padding: 0px 10px;font-size: 13px;text-align: right;z-index: 60;">Вы экономите: <span style="width: 80px; display: inline-block;font-size: 13px;">0</span>.-</div>\
                        <div class="clear"></div>\
                        <div class="registration">\
                            <a href="/cart/?action_4=order" class="order_page flat-btn orange huge" style="font-weight: bold;">ОФОРМИТЬ ЗАКАЗ</a>\
                            <a href="#" class="continue">Продолжить покупки</a>\
                            <div class="clear"></div>\
                        </div>\
                        <div class="clear"></div>'
    };

    Cart.changeHTML(HTML);
    var loader = $('<div class="opaque" style="width:auto !important;background-image:none !important;float:none !important;margin:0 !important;padding:0 !important;position:absolute !important;z-index:1000 !important;background-color: black !important;bottom:0 !important;right:0 !important;left:0 !important;top:0 !important;opacity:0.5 !important;"><img style="display: block; top: 50%; margin-top: -8px; position: absolute; left: 50%; margin-left: -8px;" src="http://st.biglion.ru/img/cart/ajax-loader.gif"></div>');
    $('div#cart_menu').append( '<div class="basket radius_0_0_4_4" style="background:#fff;"><p class="no_one_in_cart">В корзине нет ни одного товара.</p></div>' );

    $(Cart).bind( 'Cart.startRequest', function(e){
        $(loader).height( $('div#cart_btn').outerHeight(true) );
        $('div#cart_btn').prepend( loader );
    });

    $(Cart).bind( 'Cart.endRequest', function(e){
        $(loader).remove();
    });
    $(Cart).bind( 'Cart.errorRequest', function(e){
        $(loader).remove();
    });

    $(Cart).bind( 'Cart.getHTML', function(e, data, html){
        var is_furniture = 0;
        if (data.cart) {
            for(var i in data.cart){
                is_furniture |= data.cart[i].is_furniture;
            }
        }
        $('div#cart_menu div.basket').remove();
        $('div#cart_btn div.cart_icon').html( data.allcount > 99 ? '99+' : data.allcount );
        if (!data.allcount) {
            $('div#cart_menu').empty().append( '<div class="basket radius_0_0_4_4" style="background:#fff;"><p class="no_one_in_cart">В корзине нет ни одного товара.</p></div>' );
            $('#cart_popup').dialog('close');
            return false;
        }

        Cart.counterInput('.sub_header input', html);
        $('div.sum > span', html).html( data.totalcost );
        $('div.buy_more span', html).html( 3000 - +data.totalcost );

        if (data.allcount > 3) {
            $('div.info:gt(2)', html).remove();
        }


        $(Cart).trigger('Cart.googleAnalytics', [html]);
        $('div#cart_menu').empty().append( html );

        $('div#cart_menu div.delete').bind('click', function(){
            var pid = $(this).attr('data-id');
            if(!pid) return false;
            var el = {};
            el["cart_item_id_4"] = pid;
            Cart.del( el );
        });

        if (addToCartClicked) {
            $cartPopup = Cart.getHTML(data, popupHTML, true);

            $('div.sum > span', $cartPopup).html( data.totalcost );
            $('div.dis > span', $cartPopup).html( (data.discount != -1 ? data.discount : 0) );
            if (+data.totalcost < 3000 && !is_furniture && data.delivery.amount) {
                $('div.buy_more > span', $cartPopup).html( 3000 - data.totalcost );
                $('div.buy_more', $cartPopup).show();
            }

            //var dt = new Date();
            //if (data.totalcost >= 1500) {
            //    if (dt.getMonth()+1 == 11 && dt.getDate() >= 30 || dt.getMonth()+1 == 12 && dt.getDate() <= 4) {
            //        $('div.buy_more_present', $cartPopup).show();
            //    }
            //}

            var dt = new Date();
            if (dt.getYear() == 114 && dt.getMonth()+1 == 11 && dt.getDate() <= 21) {
                for (var i in data.cart) {
                    if (data.cart[i]['1RUB']) {
                        $('div.promo_1rub_text', $cartPopup).show();
                        break;
                    }
                }
            }

            // промо "Подарки на товары"
            if (data.show_product_present_text) {
                var product_present_text = 'Сделайте заказ товаров еще на сумму ' + (3000 - data.totalcost) + ' рублей и получите подарок!';
                if (data.totalcost >= 5000) {
                    product_present_text = 'Ваш заказ составляет ' + data.totalcost + ' рублей, получите подарок третьей категории';
                } else if (data.totalcost >= 4000) {
                    product_present_text = 'Ваш заказ составляет ' + data.totalcost + ' рублей, получите подарок второй категории';
                } else if (data.totalcost >= 3000) {
                    product_present_text = 'Ваш заказ составляет ' + data.totalcost + ' рублей, получите подарок первой категории';
                }
                $('div.product_present_text > span', $cartPopup).html(product_present_text);
                $('div.product_present_text', $cartPopup).show();
            }

            if($('#cart_popup').length > 0){
                $('#cart_popup').empty();
            }else{
                $('<div id="cart_popup"></div>').appendTo(document.body);
            }
            $(Cart).trigger('Cart.googleAnalytics', [$cartPopup]);
            $('#cart_popup').append($cartPopup);

            $('#cart_popup select').each(function() {
                for (i=1; i<=20; i++) {
                    var opt = $("<option></option>").attr("value", i).html(i);
                    if ($(this).attr("data-value") == i) opt.attr("selected", 1);
                    opt.appendTo($(this));
                }
            });

            //Cart.counterInput('.number_units select', $cartPopup);
            Cart.counterInput('div.number_units input', $cartPopup);


            var targetHeight = $('#cartPopup').height();
            $('#cart_popup').dialog({width: 803, title: 'Корзина', resizable: false, modal: true, closeText:"Закрыть"});

            $('div#cart_popup .bsk_btn_delete').bind('click', function(){
                var pid = $(this).attr('data-id');
                if(!pid) return false;
                var el = {};
                el["cart_item_id_4"] = pid;
                Cart.del( el );
            });

            $('#cart_popup a.continue').bind('click', function() {
                $('#cart_popup').dialog('close');
            });
        }

        $('.delete-mini').bind('click', function () {
            var pid = $(this).attr('data-id');
            if (!pid) {
                return false;
            }
            var elem = {};
            elem["cart_item_id_4"] = pid;
            elem["mini"] = true;
            Cart.del(elem);
        });

        /**/
        if (data && data.block_params) {jQuery.data(document.body, "block_params",data.block_params);}

        if( data.delivery && (data.delivery.is_furniture == 1 && ( data.delivery.big_volume == 1 || data.delivery.big_weight == 1 ) ) ) {
            jQuery.data(document.body, "shw",1);
        } else {
            jQuery.data(document.body, "shw",0);
        }

        if (data.delivery && ( data.delivery.big_volume == 1 || data.delivery.big_weight == 1)) {
            jQuery.data(document.body, "big_weight",1);
        } else {
            jQuery.data(document.body, "big_weight",0);
        }

        delivery_type_check_radio(true);

        $('div.number_units div').click(function(){
            var current_num = parseInt($('input', $(this).parent()).val());

            if($(this).hasClass('minus') && current_num == 1)
                return false;
            $('input', $(this).parent()).val(current_num + parseInt($(this).attr('data-step'))).trigger('change');

            var current_num = parseInt($('input', $(this).parent()).val());
            var remCount = $('input', $(this).parent()).attr("data-rem-count");
            var orderDataID = $(this).parent().parent().attr("data-id");
            var ids = $(this).parent().parent().attr("data-id").split('_');
            if( remCount >= current_num || remCount == -1 ) {
                Cart.count( {
                                product_id_4: ids[0],
                                product_price_4: ids[1],
                                product_count_4: current_num}
                );
            } else {
                if($(this).hasClass('plus')) {
                    $('input', $(this).parent()).val((current_num-1));
                    $(Cart).trigger( 'Cart.errorRequest', ['0002'] );
                }

            }

        });

        $('div.number_units__ div, div.hproduct__ div').unbind();
        $('div.close_item.unbind').unbind();
    });
};




Cart.mainInit = function(){
    var self = this;
    $('div#cart_btn').remove();
    HTML = {
        wrap: '<div class="order_items_block"></div>',
        line: '<div class="item_order_block"></div>',
        productline: '<div class="item-number"></div>\
                        <div class="item_name" data-is-gift="%is_gift%">\
                            <div class="rel_path">\
                                <div class="item_hover_img"></div>\
                                <img src="%thumb_image_preview%" border="0"/>\
                            </div>\
                            <div class="about_item">\
                                <a target="_blank" href="%url%">%title%</a>\
                                <br/>\
                            </div>\
                        </div>\
                        <div class="price">\
                            <span>%price%</span><span id="cursm%id%">.-</span>\
                        </div>\
                        <div data-id="%id%" class="count">\
                            <div class="choose_count" data-id="%id%">\
                                <div class="pm_product hproduct">\
									<div class="minus" data-step="-1">&minus; </div>\
									<input data-rem-count="%rem_count%" data-id="%id%" value="%quantity%" maxlength="2" readonly="readonly">\
									<div class="plus" data-step="1">+</div>\
								</div>\
                            </div>\
                        </div>\
                        <div class="item-info"><span>Торопитесь!<br>Количество товаров ограничено!</span></div>\
                        <div data-id="%id%" class="close">\
                            <div class="close_item"> &times; </div>\
							&nbsp;\
                        </div>\
                        <div class="clear_block"></div>',
        head: '<h3 class="order_info_block__subHead" style="padding: 25px 0 25px 35px; font-size: 18px;">Ваша корзина</h3>\
                <div class="order_header_items">\
                            <div class="item-number">&nbsp;</div>\
                            <div class="item_name" style="padding-left: 80px; width: 320px;">Наименование</div>\
                            <div class="price">Цена</div>\
                            <div class="count">Количество</div>\
                            <div class="item-info">&nbsp;</div>\
                            <div class="close">Удалить</div>\
                        <div class="clear_block"></div>\
                        </div>',
        foot:	'<div class="summary" style="overflow: hidden;">\
                    <div class="gift_code" style="float: left"><span style="font-size: 18px"><strong>Промокод:</strong></span>\
                        <input style="vertical-align: 1px; width:180px; border:1px solid #d4d4d4; height:30px; font-weight: bold; color: #000; padding: 0 10px" type="text" data-order="2" id="bonus_program_number" data-value="введите ваш номер" value="введите ваш номер" class="bonus_program_number"><span style="padding: 5px 16px" id="apply_promocode" href="" class="flat-btn orange large apply_promocode">Применить промокод</span>\
                            <p class="red" style="display: none">/*здесь подставлялась переменная $sysw_client_caution*/<b id="error_container"></b></p></div>\
                        <div class="end_price">\
                            <div class="s-result cost"><div style="display: inline;">Промежуточный итог по корзине</div><span class="s-sum">%cost%</span>.–</div>\
                            <div class="s-total s-totalDiscount" style="display:none;"><div style="display: inline;">Скидка по промокоду</div><span class="s-sum promocode-discount">---</span>.– </div>\
                            '+(service_charge_enabled ? '<div style="color: #666666;"><div style="display: inline;">Сервисный сбор</div><span class="s-sum service_charge"> </span>.–</div>' : '')+'\
                            <div class="s-delivery delivery"><div style="display: inline;">Доставка</div><span class="s-sum">%delivery%</span>.–</div>\
                            <div class="s-buy-more"></div>\
                        </div>\
                  </div>\
                <div class="summary-footer">\
                    <div class="delivery-date planned_date">Дата передачи в службу доставки <span id="ddate"></span></div>\
                    <div class="s-total fullcost"><div style="display: inline;">Итого к оплате</div><span id="ttotalcost" class="s-sum">1519</span>.–</div>\
                    <div class="s-cheaper"><div style="display: inline;">Вы экономите</div><span class="s-sum">177 561</span>.–</div>\
                </div>'
    };

    Cart.changeHTML(HTML);

    $('div[data-cid="cart"]').on('click', '.close_item', function() {
        removePromoCode();
        Cart.del({ cart_item_id_4: $(this).parent().attr('data-id') });
        /* запускаем пересчет доставки */
        if (is_new == false && $("#place_id").val().length > 1) {
                loadDeliveryTypes(load_delivery);
        }
    });

    $(Cart).bind( 'Cart.getHTML', function(e, data, html){
        $(document).data('lastcartdata', data);

        var promo_discount = $(document).data('promo_discount');

        if ( !data.allcount ) {
            $('div.bottom_order_block').remove();
            $('#step1').html('<h2 style="margin: 20px;">Корзина пуста</h2>');
            $('#Form_2').hide();
            if ( $('#gift-box').length > 0 ) {$('#gift-box').hide(); }


            return;
        }



        $('div[data-cid="cart"] div.order_items_block').remove();
        if (service_charge_enabled == 0) {
            var sc = data.delivery.service_charge;
        } else {
            var sc = 0;
        }
        //$('.fullcost span', html).html(data.totalcost + ~~( sc ? sc : (service_charge ? service_charge : 0)));
        $('.fullcost span', html).html(data.totalcost + ~~(sc));

        $('#promocode-discount').text(promo_discount);
        $('.planned_date span', html).html(data.planned_date);
        //$('#ttotalcost').html( data.totalcost + ~~(service_charge ? service_charge : 0));

        var disc = (data.discount != -1 ? data.discount : 0);
        disc = parseInt(promo_discount) + parseInt(disc);
        $('.s-cheaper span', html).html( disc  );
        $('.s-cheaper span').html( disc );
        $("#ddate,.curent_time_bl span").html(data.planned_date);


        if (!$(".curent_time_bl span").hasClass('date_bl') && ( undefined != jQuery.data(document.body, "block_params") && jQuery.data(document.body,"block_params")['big_volume'] == 1 || jQuery.data(document.body,"block_params")['big_weight'] == 1 || jQuery.data(document.body,"block_params")['is_furniture'] == 1 ) ) {
            $(".curent_time_bl").html('<span id="courier_delivery_data">'+data.planned_date+'</span>')
        }

        if (!$(".curent_time_bl span").hasClass('date_bl') && ( undefined != jQuery.data(document.body, "block_params") && jQuery.data(document.body,"block_params")['big_volume'] == -1 && jQuery.data(document.body,"block_params")['big_weight'] == -1 && jQuery.data(document.body,"block_params")['is_furniture'] == -1 ) ) {
            $(".curent_time_bl").html('Ближайшая: <span class="date_bl" id="courier_delivery_data">'+data.planned_date+'</span>')
        }

        $('.s-result.cost span.s-sum').text($('.s-result.cost span.s-sum',html).text());
        $('.s-delivery.delivery span.s-sum').text($('.s-delivery.delivery span.s-sum',html).text());



        Cart.counterInput('.choose_count input', html);

        $('div[data-cid="cart"]')
            .append( html )
            .find('.item_order_block').each(function(i) {
                $('.item-number', this).html(i+1);
                $('>div:not(div.item_name, div.clear_block)', this).css({'height': $(this).height(), 'line-height': $(this).height() + "px"});
            });

        if (service_charge_enabled == 0) {
            var sc = data.delivery.service_charge;
        } else {
            var sc = 0;
        }
        $('div.fullcost span.s-sum').html( data.totalcost + ~~(sc) - promo_discount);


        $('div.pm_product.hproduct div').click(function(){
            removePromoCode();
            var current_num = parseInt($('input', $(this).parent()).val());
            if($(this).hasClass('minus') && current_num == 1) { return false; }
            $('input', $(this).parent()).val(current_num + parseInt($(this).attr('data-step'))).trigger('change');
            $('.address_user input[value=-1]').attr("checked",true).parents('tr').addClass("active");
            $('#d_block').css("display","none");

            if ($("#place_id").val().length > 1) {
                loadDeliveryTypes(load_delivery);
            }
        });
        //loadDeliveryTypes(load_delivery);
    });
};

//MAIN PAGE --> function to open hidden blocks
$(document).on('click',"#add_present",function(){


        if ($('.gift_order_radio:checked').length < 1) {
            $.extend(Cart.cartErrorCodes, {1000000: 'Не выбран подарок'});
            $(Cart).trigger('Cart.errorRequest', 1000000);
            return false;
        }
        var doid = $('.gift_order_radio:checked').attr("data-do");
        var dopid = $('.gift_order_radio:checked').attr("data-dop");

        $.ajax(
            {
                url: '/r/cart/?action_4=add',
                //data: { product_id_4: doid, product_count_4: 1, product_price_4:dopid, events: true,t:123321,preset_4:btoa("PROMO_PRODUCT_PRESENT_CATEGORY") },
                data: { product_id_4: doid, product_count_4: 1, product_price_4:dopid, events: true,t:123321 },
                dataType: 'json',
                type: 'GET',
                async:false,
                success: function(data){
                    console.log(data)
                }
            }
        );
    Cart.get();
    if ($("#place_id").val().length > 1) {
        loadDeliveryTypes(load_delivery);
    }
});

var get_gift_data = function(){
    var cart_url = /cart/;
    if ( !cart_url.test(document.location.href) ) {
        return false;
    }
    $.ajax(
        {
            url: '/r/cart/?action_4=get_gift_data',
            dataType: 'json',
            type: 'GET',
            async:false,
            success: function(dat){
                if (dat && dat.success && dat.data[0]) {
                    $('.gift_order_item').each(function(j){
                        $(this).find('input').attr("data-do",dat.data[j].do);
                        $(this).find('div.gift_order_item_desc').text(dat.data[j].brand+'. '+dat.data[j].title);
                        $(this).find('img').attr("src",dat.data[j].img);

                    });
                    $('#present_price').text(dat.category);
                    $('#gift-box').show();
                }
            }
        }
    );
}

var removePromoCode = function(not_remove){

    var not_remove = not_remove || false;
    var promo_type = $(document).data('promo_type');

    if (not_remove && (3 == promo_type) ){
        return false;
    }
    if (3 == promo_type) {
        $.ajax(
            {
                url: '/r/cart/?action_4=apply_promocode&remove_4=1',
                dataType: 'json',
                type: 'GET',
                async:false,
                success: function(data){}
            }
        );
        Cart.get();

    }
    $(document).data('use_promo', false);
    $(document).data('promo_type', null);
    $(document).data('promo_discount', null);
    $(document).data('promo_info', null);


    //$('.bonus_program_number').val('').blur();
    $('.bonus_program_number').val('введите ваш номер');
    jQuery.removeData(document.body, "bpn");
    $('.s-total.s-totalDiscount').hide();


}
var makeSelectable = function(item) {
    if ( $('.value_wrp', item).length > 0 ) {
        item.html( $('.value_wrp', item).html() );
    }
};

var makeUnselectable = function(item) {
    if ( $('.value_wrp', item).length == 0 ) {
        var wl, wr, ht, hb;
        wl = Math.floor(item.innerWidth() / 2);
        ht = Math.floor(item.innerHeight() / 2);
        if (item.outerWidth() % 2) { wr = wl + 1 } else { wr = wl }
        if (item.outerHeight() % 2) { hb = ht - 1 } else { hb = ht - 2 }

        item
            .wrapInner('<div class="value_wrp"></div>')
            .prepend('<div class="corner-top"></div><div class="corner-right"></div><div class="corner-bottom"></div><div class="corner-left"></div>');
        $('.corner-top', item).css({ 'border-top' : ht + 'px solid #fff', 'border-right-width' : wr, 'border-left-width' : wl });
        $('.corner-bottom', item).css({ 'border-bottom' : hb + 'px solid #fff', 'border-right-width' : wr, 'border-left-width' : wl });
        $('.corner-right', item).css({ 'border-right' : wr + 'px solid #fff', 'border-top-width' : ht, 'border-bottom-width' : hb });
        $('.corner-left', item).css({ 'border-left' : wl + 'px solid #fff', 'border-top-width' : ht, 'border-bottom-width' : hb });
    }
};

var createProductProperties = function(){

    var color =
        $('<div data-type="color" class="variationprop colors ppValue">\
                    <div class="sub_header">Цвет:</div>\
                    <div class="adds_blocks"></div>\
                    <div class="clear"></div>\
                </div>\
            ');

    var select =
        $('<div data-type="select" class="variationprop product_size_block ppValue">\
                    <div class="sub_header"></div>\
                    <div class="adds_blocks"></div>\
                    <div class="clear"></div>\
                </div>\
            ');

    var prClick = function(e){
        var self = e.target;
        if( !$(self).hasClass('color_item') && !$(self).hasClass('size_item') )
            return false;

        if( $( ( $(this).attr('data-type') == 'color' ? 'div.color_item' : 'div.size_item' ),this).length == 1
            && $( ( $(this).attr('data-type') == 'color' ? 'div.color_item' : 'div.size_item' ),this).eq(0).hasClass('selected') )
            return false;

        $(this).data('selected', null);
        if ( $(self).hasClass('unselectable') ) return false;
        if ( $(self).hasClass('selected') ) {
            changeElements();
            return false;
        }
        $( ( $(this).attr('data-type') == 'color' ? 'div.color_item' : 'div.size_item' ),this).removeClass('selected').removeAttr('id');
        var property = ($(this).data('properties'))[$(self).attr('data-j')];
        changeElements(property);
        $(self).addClass('selected').attr('id', 'choosed');
        $(this).data('selected', property );
        if(check_properties(false))
            checkPrice();
    };

    $(color).click(prClick);
    $(select).click(prClick);

    function checkPrice() {
        $('#cart-add').attr('data-price-id', "");
        $('div#BuyPrice').html( parseInt($('div#BuyPrice').attr('data-low')).formatMoney(0, undefined, ' ') + '.-');
        var _data, price;
        $('.variationprop').each(function(i, el){
            var data = $(this).data('selected');
            if( data ) {
                if( i == 0) {
                    _data = data;
                }
                if( i == $('.variationprop').length - 1 ) {
                    if( data.priceId[_data.valueId] ) {
                        price = data.priceId[_data.valueId];
                        $('#cart-add').attr('data-price-id', price);
                        $('div#BuyPrice').html( parseInt(data.price[_data.valueId]).formatMoney(0, undefined, ' ') + '.-');
                        $('.old_price').html( parseInt(data.original[_data.valueId]).formatMoney(0, undefined, ' ') + '.-');
                        $('#discount_block').html('<span>Скидка</span> ' + variations[data.priceId[_data.valueId]]['DISCOUNT'] + '%');
                    }
                } else {
                    price = data.priceId[_data.valueId];
                    _data = data;
                }
            }
        });
    };

    function changeElements(property) {
        var blocks = {};
        if( property && property.rel ) {
            for(var i=0;i<property.rel.length;i++) {
                var elId = "#PROPERTY_" + properties[property.rel[i]].propertyId;

                if( !properties[property.rel[i]] ) continue;
                if( blocks[elId] ) continue;
                else blocks[elId] = true;
            }
        } else {
            $('div[data-type="select"] div.size_item:not(.unselectable)').removeClass('selected').removeAttr('id').addClass('selectable');
            $('div[data-type="select"]').data('selected', null);
            if ( $('div[data-type="selected"]').length == 0 ) {
                $('div[data-type="select"] div.size_item').each(function() {
                    if ($(this).hasClass('dis') != true) {
                        $(this).removeClass('unselectable').addClass('selectable');
                        makeSelectable( $(this) );
                    }
                });
            }
        }
        if( blocks.length == 0 ) return false;
        for(var i in blocks){
            switch($(i).attr('data-type')) {
                case 'color':
                case 'select':
                    $( ($(i).attr('data-type') == 'color' ? 'div.color_item' : 'div.size_item') , i).not('.dis')
                        .removeClass('unselectable')
                        .addClass('selectable')
                        .each(function(){
                                  if( !(property.rel.indexOf( +$(this).attr('data-valueId') ) < 0 && $(this).hasClass('dis') != true )  ) {
                                      makeSelectable($(this));
                                      $(this).removeClass('unselectable').addClass('selectable');
                                  } else {
                                      $(this).addClass('unselectable').removeClass('selectable').removeClass('selected').removeAttr('id');
                                      makeUnselectable($(this));
                                  }
                              });
                    break;
            }
        }
    };

    $(function(){
        for(var i in pr_elements) {
            if( !pr_elements[i][0] ) continue;

            if( pr_elements[i][0].type === 'select' ) {
                var new_select = $(select).clone(true);
                var cc = 0;
                var items = [];

                $(new_select)
                    .attr( 'id', 'PROPERTY_' + i )
                    .attr( 'data-i', i )
                    .find('div:eq(0)')
                    .append(' ' + pr_elements[i][0].name + ':')
                    .end()
                    .data( 'properties', pr_elements[i] );

                for (var j= 0, prLength = pr_elements[i].length; j < prLength; j++) {
                    if (pr_elements[i][j].price) {
                        cc++;
                        for (var n in pr_elements[i][j].priceId) {
                            if ( pr_elements[i][j].priceId[n] in variations && +variations[pr_elements[i][j].priceId[n]]['VARIATION_MAX_COUPONE'] > 0 ) {
                                items[pr_elements[i][j].valueId] = { dataj: j, value: pr_elements[i][j].value[0], select: true };
                                items[pr_elements[i][j].valueId] = { dataj: j, value: pr_elements[i][j].value[0], select: true, test:123 };
                            } else {
                                if (!items[pr_elements[i][j].valueId] || items[pr_elements[i][j].valueId].select != true) {
                                    items[pr_elements[i][j].valueId] = { dataj: j, value: pr_elements[i][j].value[0], select: false};
                                }
                            }
                            if ( pr_elements[i][j]._value && pr_elements[i][j]._value=='size') {
                                items[pr_elements[i][j].valueId]._value = 'size';
                            }
                        }
                    }
                }

                for (var id in items) {
                    if ( items[id].select == true ) {
                        $('<div class="size_item selectable" data-valueId="' + id + '" '+ ((items[id]._value) ? (' data-type='+items[id]._value) : '') + '  data-j='+ items[id].dataj +'>'+ items[id].value +'</div>').appendTo( $('div.adds_blocks', new_select) );
                    } else {
                        $('<div class="size_item unselectable dis" data-valueId="' + id + '" '+ ((items[id]._value) ? (' data-type='+items[id]._value) : '') + ' data-j='+ items[id].dataj +'>'+ items[id].value +'</div>').appendTo( $('div.adds_blocks', new_select) );
                    }
                }

                if(cc > 0 ) {
                    $('div.opvars').css('display', 'block').find('div.oPsizes').prepend( new_select );
                    if(cc == 1) $('div.adds_blocks div.size_item', new_select).eq(0).not('.unselectable').attr('id', 'choosed').click();

                }
            }
        }

        $('div.options_product div.oPsizes .unselectable').each(function() { makeUnselectable($(this)); });
        var txt = 0;
        $('.size_item').each(function () {
            if ( isNaN(parseInt($(this).text().charAt(0))) && ($(this).attr("data-type") == "size") ) {
                txt = 1;
                return;
            }
        });
        if (txt == 1) {
            fix_letter_sizes();
        } else {
            fix_num_sizes();
        }
    });
}
function compare(a,b) {
    return (a.weight - b.weight)


}
function fix_letter_sizes() {
    var _sizes = [];
    var normal_sizes = {'XS':0,'S':1,'M':2,'L':3,'XL':4,'XXL':5,'XXXL':6};

    $('.size_item').each(function () {
        if ($(this).attr("data-type") == "size") {
            $(this).parent().addClass("data-type");
            var repl = $(this).text().replace(/^[a-zA-Z]+/g, '');
            _sizes[$(this).attr("data-j")] = {
                'obj': $(this),
                'clearname': $(this).text().replace(repl, ''),
                'weight': 0
            };
            $(this).remove();
        }
    });

    for (var i in _sizes) {
        _sizes[i].weight = normal_sizes[_sizes[i].clearname];
    }
    _sizes.sort(compare);

    for (var i in _sizes) {
        $('.data-type').append(_sizes[i].obj);
    }
}

function fix_num_sizes(){

    var _sizes = [];

    $('.size_item').each(function () {
        if ($(this).attr("data-type") == "size") {
            $(this).parent().addClass("data-type");
            var repl = $(this).text().replace(/^[0-9]+/g, '');
            var nm = $(this).text().replace(",",".").replace(repl, '');
            _sizes[$(this).attr("data-j")] = {
                'obj': $(this),
                'clearname': nm,
                'weight': nm
            };
            $(this).remove();
        }
    });
    _sizes.sort(compare);

    for (var i in _sizes) {
        $('.data-type').append(_sizes[i].obj);
    }
}

//MAIN PAGE --> function to open hidden blocks

function clickToggleBtn(btn, list, arr, bgPosOpened, bgPosClosed, fn, isActive, callback){
    $(btn).live('click', function(){
        if( fn && typeof fn == 'function' ) fn();
        if( !isActive ){
            isActive = 'active';
        }

        if( $(this).hasClass(isActive) ){
            $(this).removeClass(isActive);
            $(arr).css({backgroundPosition: bgPosClosed});
            $(list).stop(true, true).animate({'height': 'toggle'}, 300);
        }else{
            $(this).addClass(isActive);
            $(arr).css({backgroundPosition: bgPosOpened});
            $(list).stop(true, true).animate({'height': 'toggle'}, 300);
        }
        if(callback && typeof callback == 'function') callback();
    });
};

function toggleBtn(btn, list, arr, bgPosOpened, bgPosClosed, fn, isActive, callback, types){
    if( !types ) return false;
    if( types.hover && !('ontouchstart' in document.documentElement) ) {
        $(btn).bind('mouseenter mouseleave', function(e){
            if( fn && typeof fn == 'function' ) fn();
            if( !isActive ){
                isActive = 'active';
            }
            switch(e.type){
                case 'mouseenter':
                    $(this).addClass(isActive);
                    $(arr).css({backgroundPosition: bgPosOpened});
                    $(list).stop(true, true).show();
                    break;
                case 'mouseleave':
                    $(this).removeClass(isActive);
                    $(arr).css({backgroundPosition: bgPosClosed});
                    $(list).stop(true, true).hide();
                    break;
            }
            if(callback && typeof callback == 'function') callback();
        });
    }
    if( types.click || types.touch ) {
        _e = ('ontouchstart' in document.documentElement) ? 'touchstart' : (types.click ? 'click' : null);
        if( !_e ) return false;
        $(btn).bind(_e, function(e){
            if( e.type == 'touchstart' ){
                var touch = e.originalEvent.touches[0] || e.originalEvent.targetTouches[0];
                var _tag = touch.target.tagName.toLowerCase();
                if(
                    _tag == 'a'
                        || _tag == 'input'
                        || _tag == 'li'
                    ) return true;
                else e.preventDefault();
            }
            if( fn && typeof fn == 'function' ) fn();
            if( !isActive ){
                isActive = 'active';
            }

            if( $(this).hasClass(isActive) ){
                $(list).stop(true, true).animate({'height': 'hide'}, 300);
                $(arr).css({backgroundPosition: bgPosClosed});
                $(this).removeClass(isActive);
            }else{
                $(arr).css({backgroundPosition: bgPosOpened});
                $(this).addClass(isActive);
                $(list).stop(true, true).animate({'height': 'show'}, 300);
            }
            if(callback && typeof callback == 'function') callback();
        });
    }
};

function swapChoosed(swapField, btn, list){
    var thisName = $(btn).html();
    $(btn).remove();
    $(list).prepend('<li>'+ $(swapField).html() +'</li>');
    $(swapField).html('').html(thisName);
    $('li', list).sort();
};

function swapChoosednoRemove(swapField, btn, list){
    if ( swapField.parent().is('#hotel-min') || swapField.parent().is('#hotel-max')) {
        var thisName = $(btn).html();
    } else {
        var thisName = $(btn).text();
    }

    if ( $(btn).parent().parent().is('#filter-color') ) {
        $(swapField).addClass('color').attr('style', $(btn).attr('style')).html('');
    } else if ( $(btn).is('.color-all') ) {
        $(swapField).removeClass('color').attr('style', '').html('Выберите цвет');
    } else {
        $(swapField).html('').html(thisName);
        $('li', list).sort();
    }
};


//MEGA SORT!

function Sort(obj, context, field, type, direction){
    if( $(obj).length > 0 ){
        var type = type || 'string';
        for(var i in arguments){
            sortArguments[i] = arguments[i];
        }
        sortArguments[3] = type;
        var direction = direction || sortArguments[4] || 1;


        var parent = $(obj).parent();
        var _obj = $(obj).detach();
        if( $(context, _obj).length > 0 ){
            for(var i=0; i< ($(context, _obj).length - 1); i++ ){
                for(var j=i+1; j< $(context, _obj).length; j++ ){
                    var _i = $(context, _obj).get(i);
                    var _j = $(context, _obj).get(j);
                    var flag = false;
                    if(type == 'string') flag = ( $(_j).attr(field).toLowerCase() < $(_i).attr(field).toLowerCase() && $(_j).attr(field).toLowerCase() !== $(_i).attr(field).toLowerCase() );
                    if(type == 'int') flag = ( Number($(_j).attr(field)) < Number($(_i).attr(field)) && Number($(_j).attr(field)) !== Number($(_i).attr(field)));

                    if( (flag && direction === 1) || ( !flag && direction === -1 )){
                        $(_i).before( $(_j) );
                    }
                }
            }
            $(parent).append(_obj);
        }
    }
};


//POPUP WINDOW

$('div#popup_select_btn').live('click', function(){
    if( $(this).hasClass('active') ){
        $(this).removeClass('active');
        $('ul#popup_select').animate({'height': 'hide'}, 200);
    }else{
        $(this).addClass('active');
        $('ul#popup_select').animate({'height': 'show'}, 200);
    }
});

$('ul#popup_select li').live('click', function(){
    var
        thisId = $(this).attr('data-id'),
        thisName = $(this).html();

    $('input#outsideCityId').val(thisId);
    $('div#popup_select_btn div.count_num').html('').html(thisName);
});


//LOAD IMAGES

var
    DealImage = {
        preloadTimer : null,
        imgLoaderLock : false
    };

function goCheckPosition() {
    DealImage.imgLoaderLock = true;
    clearTimeout(DealImage.preloadTimer);

    var
        winHeight = parseInt($(window).height()),
        offsetTop = $(window).scrollTop();

    $('div.NEW_CLASS').each(function(){
        var offsetTopCurrent = parseInt( $(this).offset().top);
        if( offsetTopCurrent - offsetTop < winHeight && offsetTopCurrent + 400 > offsetTop ){
            $(this).attr('src', $(this).attr('data-src')).attr('data-src','');
            $(this).removeClass('loaded');
        };
    });
    DealImage.imgLoaderLock = false;
};

function startDealImageLoad() {
    clearTimeout(DealImage.preloadTimer);
    if( !DealImage.imgLoaderLock )
        DealImage.preloadTimer = setTimeout(function(){ goCheckPosition() }, 300);
};


// GET MORE IMAGES IF DISPLAY:NONE;
/*
 function getMoreDeals() {
 if( $('#preFooter').length == 0 ) return false;
 var top = parseInt($('#preFooter').offset().top)
 , offsettop = $(window).scrollTop()
 , winHeight = parseInt($(window).height());
 if( top - offsettop < winHeight)
 $('.currentActionsItem.invisible:lt(6)').removeClass('invisible');
 };
 */

// SORTING SCRIPT

function sortUl(obj){
    var
        menu = $(obj).children('li').get();

    menu.sort(function(a, b) {
        var
            val1 = $(a).text().toUpperCase(),
            val2 = $(b).text().toUpperCase();

        return (val1 < val2) ? -1 : (val1 > val2) ? 1 : 0;
    });

    $.each(menu, function(index, row) {
        $(obj).append(row);
    });
};

/*

 // CHECKBOX ON ALL SITE

 // create block <div send-input="" class="checkboxBlock"></div> and script create new visual checkbox
 function clickCheckBox(obj){
 var
 thisInput = $(obj).attr('send-input');

 if( $(obj).hasClass('active') ){
 $(obj).removeClass('active');
 $('input#'+thisInput).removeAttr('checked');
 console.log($('input#'+thisInput).attr('checked'));
 }else{
 $(obj).addClass('active');
 $('input#'+thisInput).attr('checked', 'checked');
 console.log($('input#'+thisInput).attr('checked'));
 }
 };

 */


// SLIDE SHOW BLOCK

// слайдит блок с position:absolute, bottom:0 - спрятанный за overflow:hidden
function slideShowBlock(obj, slideBlock, bottom){
    $(obj).bind({
                    mouseenter: function(){
                        $(slideBlock, this).stop(true, true).animate({'bottom': 0}, 300);
                    },
                    mouseleave: function(){
                        $(slideBlock, this).stop(true, true).css('bottom', bottom);
                    }
                });
};


// FOR FRIENDS
if (typeof String.prototype.trimLeft !== "function") {
    String.prototype.trimLeft = function() {
        return this.replace(/^\s+/, "");
    };
}
if (typeof String.prototype.trimRight !== "function") {
    String.prototype.trimRight = function() {
        return this.replace(/\s+$/, "");
    };
}
if (typeof Array.prototype.map !== "function") {
    Array.prototype.map = function(callback, thisArg) {
        for (var i=0, n=this.length, a=[]; i<n; i++) {
            if (i in this) a[i] = callback.call(thisArg, this[i]);
        }
        return a;
    };
}
function getCookies() {
    var c = document.cookie, v = 0, cookies = {};
    if (document.cookie.match(/^\s*\$Version=(?:"1"|1);\s*(.*)/)) {
        c = RegExp.$1;
        v = 1;
    }
    if (v === 0) {
        c.split(/[,;]/).map(function(cookie) {
            var parts = cookie.split(/=/, 2),
                name = decodeURIComponent(parts[0].trimLeft()),
                value = parts.length > 1 ? decodeURIComponent(parts[1].trimRight()) : null;
            cookies[name] = value;
        });
    } else {
        c.match(/(?:^|\s+)([!#$%&'*+\-.0-9A-Z^`a-z|~]+)=([!#$%&'*+\-.0-9A-Z^`a-z|~]*|"(?:[\x20-\x7E\x80\xFF]|\\[\x00-\x7F])*")(?=\s*[,;]|$)/g).map(function($0, $1) {
            var name = $0,
                value = $1.charAt(0) === '"'
                    ? $1.substr(1, -1).replace(/\\(.)/g, "$1")
                    : $1;
            cookies[name] = value;
        });
    }
    return cookies;
}
function getCookie(name) {
    return getCookies()[name];
}



$(function(){

    // IF BROWSER IE < 9
    if( $.browser.msie && $.browser.version < 7 ){
        var ieBrowsersBlock = $('\
		<div id="browsers_block_for_ie">\
	        <div class="browsers_block_in">\
	            <p>Для корректного отображения сайта установите новую версию браузера</p>\
	            <a class="first" href="https://www.google.com/chrome?hl=ru">Chrome</a>\
	            <a href="http://www.mozilla.org/ru/firefox/new/">FireFox</a>\
	            <a href="http://ru.opera.com/">Opera</a>\
	            <a href="http://www.apple.com/ru/safari/download/">Safari</a>\
	            <a href="http://windows.microsoft.com/ru-RU/internet-explorer/products/ie/home">InternetExplorer</a>\
	            <div class="clear"></div>\
	            <div id="close_btn">скрыть</div>\
	        </div>\
	    </div>\
	');

        $('body').prepend( ieBrowsersBlock );

        var
            closeBtn = $('div#browsers_block_for_ie div#close_btn'),
            thisBlock = $('div.browsers_block_in');

        $(closeBtn).click(function(){
            if( thisBlock.hasClass('closed') ){
                thisBlock.removeClass('closed');
                closeBtn.html('скрыть');
                $('a', thisBlock).show();
            }else{
                thisBlock.addClass('closed');
                closeBtn.html('показать');
                $('a', thisBlock).hide();
            }
        });
    }


    // imba Biglion - likes
    $(".biglionHeart").click(function(){
        object=$(this);
        $.ajax({
                   type: "GET",
                   url: "/general/ajax.php",
                   data: { deal_id: $(this).attr("data-deal-id"), location: "charset", cl: "c_likes", method: "register" }
               }).done(function( msg ) {
                           if(msg !=''){
                               object.removeClass('default');
                               object.next().html(msg);
                           }
                       });
    });

    // imba Biglion - likes (OPPPA!!! v4 style!!!)
    //    $(".ai_likes_icon").on('click',function(){
    //        object=$(this);
    //        $.ajax({
    //            type: "GET",
    //            url: "/general/ajax.php",
    //            data: { deal_id: $(this).attr("data-deal-id"), location: "charset", cl: "c_likes", method: "register" }
    //        }).done(function( msg ) {
    //                if(msg !=''){
    //                    object.removeClass('ai_default');
    //                    object.next().html(msg);
    //                }
    //            });
    //    });

    // SLIDE SHOW BLOCK

    //parallel-main-new.tpl
    slideShowBlock( $('div.main_catalog_block .travel_and_recreation'), 'div.more_info_h', '-221px');

    //parallel-main.tpl



    // CHECKBOX ON ALL SITE

    // создать блок <div send-input="" class="checkboxBlock"></div> и hidden input
    // по дефолту является чекбоксом
    // указать send-input="" для передачи в инпут данных с ID, указанным в send-input
    // указать класс .radio для радио
    // указать data-value="" для передачи данных в инпут (только для радио)

    $('.checkboxBlock').live('click', function(){
        var
            thisInput = $(this).attr('send-input');

        if( $(this).hasClass('radio') ){
            var
                thisFamily = $(this).attr('data-family'),
                thisValue = $(this).attr('data-value');

            if( !$(this).hasClass('active') ){
                $('.checkboxBlock[data-family='+ thisFamily +'].active').removeClass('active');
                $(this).addClass('active');
                $('input#'+thisInput).val(thisValue).change();
            }
        }else{
            if( $(this).hasClass('active') ){
                $(this).removeClass('active');
                $('input#'+thisInput).removeAttr('checked');
                $('input#'+thisInput).val(0).change();
            }else{
                $(this).addClass('active');
                $('input#'+thisInput).attr('checked', 'checked');
                $('input#'+thisInput).val(1).change();
            }
        }
    });


    // DROP LIST ON ALL SITE

    // if <li> has class DISABLED drop list wont close after click
    $('div.drop_list_block').click(function(e){
        if( !$(e.target).hasClass('disabled') ){
            if( $(this).hasClass('active') ){
                $(this).removeClass('active');
                $('.arr_black_bot', this).css({backgroundPosition: '0 -16px'});
                $('ul', this).stop(true, true).animate({'height': 'toggle'}, 300);
            }else{
                $('.arr_black_bot', $('div.drop_list_block.active')).css({backgroundPosition: '0 -16px'});
                $('div.drop_list_block.active ul').hide();
                $('div.drop_list_block.active').removeClass('active');


                // use data-height to add height to UL block for overflow:scroll
                if( $(this).attr('data-height') ){
                    $('ul', this).show();
                    listHeight = $(this).attr('data-height');
                    $('ul', this).height( listHeight );

                    if( $('ul li', this).length * $('ul li', this).outerHeight(true) > listHeight ){
                        $('ul', this).height( listHeight ).css('overflow-y', 'scroll');
                    }
                    $('ul', this).hide();

                }else{
                    if( $('li', this).length > 20 ){
                        $('ul', this).show();
                        listHeight = 20 * parseInt($('li', this).outerHeight(true));
                        $('ul', this).height( listHeight ).css('overflow-y', 'scroll').hide();
                    }
                }

                $(this).addClass('active');
                $('.arr_black_bot', this).css({backgroundPosition: '0 1px'});
                $('ul', this).stop(true, true).animate({'height': 'toggle'}, 300);
            }
        }
    });

    // IF <li> has class DISABLED drop list wont close after click
    $('div.drop_list_block li:not(.disabled)').live('click' ,function(){
        var sendInputId = $(this).parents('div.drop_list_block').eq(0).attr('send-input');
        if( $(this).attr('data-value') !== undefined )
            newVal = $(this).attr('data-value');
        else
            newVal = $(this).html();

        swapChoosednoRemove( $('div.visible_value', $(this).parent().parent()), $(this), $(this).parent() );
        if( sendInputId !== undefined && sendInputId != '' )
            $('input#'+ sendInputId).val( newVal ).change();
    });


    //LOADER IMAGES ON MAIN PAGE

    $(window).bind('mousewheel scroll', function(){
        //getMoreDeals();
        startDealImageLoad();
    });
    //getMoreDeals();
    startDealImageLoad();




    //MAIN PAGE -->  TOP BLOCK -->   BUY BY CATEGORIES BTN

    /*
     toggleBtn(
     'div#buy_by_cats',
     'div.buy_by_cats',
     'div.arr_white_bot',
     '-18px 0px',
     '-18px -19px',
     null,
     null,
     null,
     {touch:true, hover:true}
     );
     */

    if( $('div#top_main_category_visible').length != 0 ){
        $('div#buy_by_cats').unbind();
        $('div#buy_by_cats').addClass('active');
        $('div#buy_by_cats div.arr_white_bot').css({backgroundPosition: '-18px 0px'});
        $('div#buy_by_cats div.buy_by_cats').show();
    }


    //OPEN SUBMENU

    $('div.buy_by_cats ').bind({
                                   mouseleave:function(){
                                       $('ul.buy_by_cats_ul:visible').hide();
                                       $('div.buy_by_cats_left li#active div.arr_orange_right').remove();
                                       $('div.buy_by_cats_left li#active').removeAttr('id');
                                   }
                               });

    $('div.buy_by_cats_left li').bind({
                                          mouseenter:function(){
                                              var thisCatId = $(this).attr('data-cat');

                                              if( $('ul.buy_by_cats_ul[data-cat="'+ thisCatId +'"] li').length == 0 ) {
                                                  $('ul.buy_by_cats_ul[data-cat]').hide();
                                                  $('div.buy_by_cats_left li#active div.arr_orange_right').remove();
                                                  $('div.buy_by_cats_left li#active').removeAttr('id');
                                                  return false;
                                              }

                                              if( $('ul.buy_by_cats_ul:visible').length == 0 ){
                                                  $('div.buy_by_cats_left li#active').removeAttr('id');
                                                  $('div.buy_by_cats_right').height( $('div.buy_by_cats_left').height() );
                                                  if( $(this).attr('data-cat') ){
                                                      $(this).attr('id', 'active');
                                                      $(this).append('<div class="arr_orange_right"></div>');
                                                  };
                                                  $('ul.buy_by_cats_ul[data-cat="'+ thisCatId +'"]').stop(true, true).animate({'width': 'show'}, 300);
                                              }else{
                                                  if( $(this).attr('id') != 'active' && $(this).attr('data-cat') ){

                                                      $('div.buy_by_cats_left li#active div.arr_orange_right').remove();
                                                      $('div.buy_by_cats_left li#active').removeAttr('id');

                                                      $(this).attr('id', 'active');
                                                      if( $(this).attr('data-cat') ){
                                                          $(this).append('<div class="arr_orange_right"></div>');
                                                      }
                                                      $('ul.buy_by_cats_ul:visible').addClass('hide');
                                                      $('ul.buy_by_cats_ul[data-cat="'+ thisCatId +'"]').show();
                                                      $('ul.buy_by_cats_ul.hide').hide().removeClass('hide');

                                                  }else{

                                                      $('div.buy_by_cats_left li#active div.arr_orange_right').remove();
                                                      $('div.buy_by_cats_left li#active').removeAttr('id');

                                                      $('ul.buy_by_cats_ul').hide().removeClass('hide');
                                                      if( $(this).attr('data-cat') ){
                                                          $(this).attr('id', 'active');
                                                      }
                                                  }
                                              };
                                          }
                                      });


    //MAIN PAGE -->  TOP BLOCK -->   OPEN ALL SEARCH CATEGORIES

    $('div#main_search_cats li').live('click', function(e){
        var
            selfBtn = $('div#choose_cats span'),
            thisName = $(e.target).html(),
            prevTxt = $(selfBtn).attr('data-text'),
            thisId = $(this).attr('data-id');

        $('#search_category_id').val(thisId);
        $(e.target).remove();

        if( prevTxt ){
            $('div#main_search_cats ul').prepend('<li data-text="vse">Везде</li>');
            $(selfBtn).removeAttr('data-text');
        }else{
            $('div#main_search_cats li:last').before('<li>'+ $(selfBtn).html() +'</li>');
        }

        if( $(e.target).attr('data-text') )
            $(selfBtn).attr('data-text', 'vse');

        $(selfBtn).html('').html(thisName);
        var thisWidth = $(selfBtn).outerWidth();
        $('div#choose_cats').next().width(304 - thisWidth);	             // Input.width - ( Btn_New.width - Btn_Old.width )
        $('div#choose_cats').click();

        $('div#main_search_cats').hide();
        $('div#choose_cats.active div.arr_black_bot').css({backgroundPosition: '0px -16px'});
        $('div#choose_cats.active').removeClass('active');
    });

    toggleBtn(
        'div#choose_cats',
        'div#main_search_cats',
        'div#choose_cats div.arr_black_bot',
        '-18px 0px',
        '0px -16px',
        null,
        null,
        null,
        {touch:true, hover:true}
    );

    //SEARCH FORM SUBMIT

    $('div.search_btn').live('click', function(){
        //	    if( $('form#search_form input[type="text"]').val() == 'biglion пираты' ){
        //	        $('div#header a.main_logo_top').before('<a href="/" class="main_logo_top_pirate"></a>');
        //		    $('div#header a.main_logo_top').animate({top: -50},400, function(){ $(this).remove() });
        //	    }else{
        if($('form#search_form input[type="text"]').val()!='Что Вы ищете?' && $('form#search_form input[type="text"]').val()!='')
            $('form#search_form').submit();
        //	    }
    });


    //MAIN PAGE -->  TOP BLOCK -->   OPEN USER MENU

    toggleBtn(
        'div#user_btn',
        'div#user_menu',
        'div#user_btn div.arr_black_bot',
        '-18px 0px',
        '0px -16px',
        null,
        'grey_black_mat',
        null,
        {touch:true, hover:true}
    );

    //MAIN PAGE -->  TOP BLOCK -->   OPEN CART

    toggleBtn(
        'div#cart_btn',
        'div#cart_menu',
        'div#cart_btn>div.arr_black_bot',
        '-18px 0px',
        '0px -16px',
        null,
        'grey_black_mat',
        null,
        {touch:true, hover:true}
    );


    //MAIN PAGE -->   MAIN BANNER

    var intervalId,
        $banBlock = $('div.main_banner_block'),
        $banPagi = $('#banner_pagi'),
        $banPagiItem = $('div', $banPagi);

    if( $banBlock.length > 0 ){

        $('>a', $banBlock).css({'position': 'absolute', 'z-index': 10, 'opacity': 0});
        $('>a:eq(0)', $banBlock).css({'position': 'absolute', 'z-index': 15, 'opacity': 1});

        function goInterval(){
            intervalId = setTimeout( function() { goSlideBanner(); } , 4500);
        }

        var goSlideBanner = function(){
            if ($('div#active', $banPagi).next().length == 0) {
                $('div:eq(0)', $banPagi).click();
            }else{
                $('div#active', $banPagi).next().click();
            };
        };

        var
            bannerCountPagi = $banPagiItem.length,
            pagiWidth = (+bannerCountPagi * parseInt($banPagiItem.outerWidth(true))) / 2;

        $banPagi.css('margin-left', -pagiWidth);

        $('div.main_banner_mask_window_no, div.main_banner_mask_window').live('click', function(){
            document.location = $('>a', $banBlock).filter(function(){ if( $(this).css('opacity') != 0 )return $(this) }).attr('href');
        });

        $banPagiItem.unbind('click').bind('click', function(){
            clearTimeout(intervalId);
            var
                preIndex = $('div#active', $banPagi).index(),
                thisIndex = $(this).index(),
                maskPos = ( bannerCountPagi - 1 - thisIndex ) * 30;

            if( $(this).attr('id') != 'active' ){
                $('div#active', $banPagi).removeAttr('id');
                $(this).attr('id', 'active');
                $('div.main_banner_mask_arr').css({backgroundPosition: '-'+ maskPos +'px 0'});

                $('>a:eq('+ preIndex +')', $banBlock).css({'position': 'absolute', 'z-index': 10}).animate({opacity: 0}, 450);
                $('>a:eq('+ thisIndex +')', $banBlock).css({'position': 'absolute', 'z-index': 15}).stop(true, true).animate({opacity: 1}, 450, function(){
                    clearTimeout(intervalId);
                    goInterval();
                });
            };
        });

        $('>a', $banBlock).bind({
                                    mouseenter: function(){
                                        clearTimeout(intervalId);
                                    },
                                    mouseleave: function(){
                                        goInterval();
                                    }
                                });

        goInterval();
    };

    //MAIN PAGE -->   MAIN CATALOG -->   CHOOSE METRO BTN

    $('div.more_info_top').each(function(){
        $(this).css('bottom', -1 * +$(this).outerHeight()).attr('data-margin', $(this).outerHeight());
    });

    $('div.catalog_container .action_item').bind({
                                                     mouseenter: function(){
                                                         $('div.more_info', this).stop(true, true).animate({'bottom': 0}, 300);
                                                         $('div.more_info_top', this).stop(true, true).animate({'bottom': 0}, 300);
                                                     },
                                                     mouseleave: function(){
                                                         $('div.more_info', this).stop(true, true).css('bottom', '-105px');
                                                         $('div.more_info_top', this).stop(true, true).css('bottom', -1 * +$('div.more_info_top', this).attr('data-margin'));
                                                         $(this).removeClass('active');
                                                         $('span.arr_white_top', this).css({backgroundPosition: '-18px 0px'});
                                                         $('div.more_metro').hide();
                                                     }
                                                 });

    $('div.choosed_metro').live('click', function(){
        if( $(this).hasClass('active') ){
            $(this).removeClass('active');
            $('span.arr_white_top', this).css({backgroundPosition: '-18px 0px'});
            $(this).parent().parent().find('div.more_metro').stop(true, true).animate({'height': 'toggle'}, 300);
        }else{
            $(this).addClass('active');
            $('span.arr_white_top', this).css({backgroundPosition: '-18px -19px'});
            $(this).parent().parent().find('div.more_metro').stop(true, true).animate({'height': 'toggle'}, 300);
        };
        if( $(this).parent().parent().find('div.more_metro ul li').length != 0 )
            return false;
    });

    //INSIDE PAGE -->   TOP FILTER

    $('#catalog_filter_block .filter_list').live('click', function(){
        if( $(this).hasClass('active') ){
            $(this).removeClass('active');
            $('div.arr_black_bot', this).css({backgroundPosition: '0 1px'});
            $('ul' ,this).stop(true, true).animate({'height': 'toggle'}, 300);
        }else{
            $('#catalog_filter_block .filter_list.active ul').css('display', 'none');
            $('#catalog_filter_block .filter_list.active').removeClass('active');
            $(this).addClass('active');
            $('div.arr_black_bot', this).css({backgroundPosition: '0 -16px'});
            $('ul' ,this).stop(true, true).animate({'height': 'toggle'}, 300);
        };
    });

    $('#catalog_filter_block .filter_list li').live('click', function(){
        swapChoosed(  );
    });


    //ITEM INSIDE -->   COUNT BLOCK

    clickToggleBtn(
        'div#count_item_btn',
        'div#count_item_btn ul',
        'div#count_item_btn div.arr_black_bot',
        '0 1px',
        '0 -16px',
        null,
        null,
        null,
        {touch:true, hover:true}
    );

    $('div#count_item_btn li').live('click', function(){
        swapChoosed( $('div#count_item_btn div.count_num'), $(this), $('div#count_item_btn ul') );
        sortUl('div#count_item_btn ul');
    });


    // IN CART

    $('div.basket div.count_item_btn').live('click', function(){
        if( $(this).hasClass('active') ){
            $(this).removeClass('active');
            $('div.arr_black_bot', this).css({backgroundPosition: '0 -16px'});
            $('ul', this).stop(true, true).animate({'height': 'toggle'}, 300);
        }else{
            $(this).addClass('active');
            $('div.arr_black_bot', this).css({backgroundPosition: '0 1px'});
            $('ul', this).stop(true, true).animate({'height': 'toggle'}, 300);
        }
    });



    //USER BLOCk --> SUBSCRIPTION

    $('div#city_item_btn').live('click', function(){
        if( $(this).hasClass('active') ){
            $(this).removeClass('active');
            $('div#city_item_btn div.arr_black_bot').css({backgroundPosition: '0 -16px'});
            $('div#city_item_btn ul').stop(true, true).animate({'height': 'toggle'}, 300);
        }else{
            $(this).addClass('active');
            $('div#city_item_btn div.arr_black_bot').css({backgroundPosition: '0 1px'});
            $('div#city_item_btn ul').stop(true, true).animate({'height': 'toggle'}, 300);
        }
    });

    $('div#city_item_btn li').live('click', function(){
        var
            thisName = $(this).html(),
            thisId = $(this).attr('data-city-id');

        $(this).remove();
        if( $('#city_item_btn .city_choosed').attr('data-choose') != 0 ){
            $('div#city_item_btn ul').prepend('<li>'+ $('div#city_item_btn div.city_choosed').html() +'</li>');
        }else{
            $('#city_item_btn .city_choosed').attr('data-choose', 1);
        }
        $('div#city_item_btn div.city_choosed').html('').html(thisName);
        $('div#city_item_btn #town_container').attr('data-city-id', thisId);
        sortUl('div#city_item_btn ul');
    });



    //ITEM INSIDE -->   BIG PHOTO ZOOM

    $('ul#item_big_photo_thums li:eq(0) a').addClass('zoomThumbActive');


    //PAYMENT_FORM ---> PAYMENT INSTRUCTION

    /* PAYMENT FORM EXAMPLES  ----- START */
    $('#exm_list li').live('click', function(){
        $('div.number_field').remove();
        $('div.price_field').remove();

        var
            payment_code = $('div.exm_title b span').html(),
            payment_price = ($('td#full_price').html()).replace(' руб.','');

        if( $(this).attr('id') != 'active') {
            $('#active').removeAttr('id');
            $(this).attr('id', 'active');
            getId = $(this).attr('data-id');
            $('.exm_img_block img').attr('src', "http://st.biglion.ru/v3/img/your_purchase/example"+getId+".jpg");
        };


        //$('div.exm_img_block').prepend( $(this).attr('data-id') == 16 ? ('<div class="price_field price_field16">'+ payment_price +'</div>') : ('<div class="number_field number_field'+ ($(this).attr('data-id') == 5 || $(this).attr('data-id') == 8) ? 5 : (($(this).attr('data-id') == 15 || $(this).attr('data-id') == 17) ? 15 : $(this).attr('data-id'))+'">'+ payment_code +'</div>'+ ($(this).attr('data-id') == 5 || $(this).attr('data-id') == 8) ? '<div class="price_field price_field15">'+ payment_price +'</div>' : ''));


        if( $(this).attr('data-id') == 4 || $(this).attr('data-id') == 5 || $(this).attr('data-id') == 7 || $(this).attr('data-id') == 14 || $(this).attr('data-id') == 15 ){
            $('div.exm_img_block').prepend("<div class='number_field number_field"+ $(this).attr('data-id') +"'>"+ payment_code +"</div>");
        };

        if( $(this).attr('data-id') == 6 ){
            $('div.exm_img_block').prepend('<div class="number_field number_field6">'+ payment_price +'</div>');
        };

        if( $(this).attr('data-id') == 17 ){
            $('div.exm_img_block').prepend('<div class="number_field number_field15">'+ payment_code +'</div><div class="price_field price_field15">'+ payment_price +'</div>');
        };

        if( $(this).attr('data-id') == 16 ){
            $('div.exm_img_block').prepend('<div class="price_field price_field16">'+ payment_price +'</div><div class="price_field price_field17"><span>'+ payment_price +'</span></div>');
        };

    });

    /* ODNOKLASSNIKI MODAL WINDOWS */

    $('.modal_link_contacts, .modal_link_support, .modal_link_prices, .modal_link_invite').live('click', function(){
        $('body').append('<div id="modal_overlay" class="modal_overlay"></div>');
        if ($('.modal').is('modal_visible')) {
            $('.modal').removeClass('modal_visible');
            $('#modal_overlay').css('display', 'none');
            $('#modal_overlay').remove();
        } else {
            if ($(this).hasClass('modal_link_contacts')) {
                $('body').append($('#modal_contacts'));
                $('#modal_contacts').addClass('modal_visible');
            } else if ($(this).hasClass('modal_link_support')) {
                $('body').append($('#modal_support'));
                $('#modal_support').addClass('modal_visible');
            } else if ($(this).hasClass('modal_link_prices')) {
                $('body').append($('#modal_prices'));
                $('#modal_prices').addClass('modal_visible');
            } else if ($(this).hasClass('modal_link_invite')) {
                $('body').append($('#modal_invite'));
                $('#modal_invite').addClass('modal_visible');
            }
            $('#modal_overlay').css('display', 'block');
            $('#modal_overlay').css('z-index', '1002');
        }
    });

    $('.modal_close').live('click', function(){
        $('.modal').removeClass('modal_visible');
        $('.modal_overlay').remove();
    });

    $(document).click(function(e){
        if ($(e.target).filter('#modal_overlay').length == 1 && $(e.target).filter('.modal:visible').length != 1) {
            $('.modal').removeClass('modal_visible');
            $('.modal_overlay').remove();
        }
    });


    //MY ORDERS

    $('div.unit_print_coupons div.print_button').live('click', function(e){
        if( $('ul', this).is(':hidden') ){
            $('div.print_button ul').hide();
            $('ul', this).show();
        }else{
            $('ul', this).hide();
        };
    });


    //    BIGLION SHADOW ON
    //
    //    $('div#action_bottom_photos a').live('click', function(){
    //        $('div#biglion_shadow').show();
    //    });


    //ALL PAGES --> TOP SUBCANT MENU --> HOVER BTN (CLEAR BORDER)

    $('div.subcat_menu a').bind({
                                    mouseenter: function(){
                                        $(this).parent().next().find('a').css({'border': 0, 'padding-left': '1px'});
                                    },
                                    mouseleave: function(){
                                        $(this).parent().next().find('a').css({'padding-left': 0, 'border-left': '1px solid #b4b4b4'});
                                    }
                                });

});



//TIMER ON PAGE
Timers = {
    timers: [],
    numerals: ['день', 'дня', 'дней'],
    tickTimers: function() {
        if(Timers.timers.length == 0) return;
        for (var i in Timers.timers) if(Timers.timers[i].time > 0) {
            Timers.timers[i].time--;

            var time = Timers.timers[i].time,
                timeS, timeM, timeH, timeD,
                str = '';

            timeS = time % 60;
            timeM = ((time - timeS) / 60) % 60;
            timeH = ((time - timeS - timeM * 60) / 3600) % 24;
            timeD = (time - timeS - timeM * 60 - timeH * 3600) / 86400;

            if(timeD) str += timeD + ' ' + numeral(timeD, Timers.numerals[0], Timers.numerals[1], Timers.numerals[2]) + ' ';
            str += (timeH < 10 ? '0'+timeH.toString() : timeH.toString()) + ':' + (timeM < 10 ? '0'+timeM.toString() : timeM.toString());
            if(!timeD) str +=  ':' + (timeS < 10 ? '0'+timeS.toString() : timeS.toString());

            Timers.timers[i].$node.html(str);
        }
        setTimeout(Timers.tickTimers, 1000);
    },
    init: function() {
        $('.countdown-timer').each(function(){
            var timer = {
                time: parseInt($(this).attr('data-ts')),
                $node: $(this)
            };
            if(isNaN(timer.time)) return;

            Timers.timers.push(timer);
        });
        Timers.tickTimers();
    }
};
$(document).ready(Timers.init);

/**
 *
 * Класс карусели, универсальна при совпадении структуры html.
 * Работает и с UL и с DIV.
 * Анимация - изменение marginLeft блока обертки карусельных элементов options.carouselWrapper
 * Инициализируется один раз для блока карусели и записывается в data элемента options.carouselBlock
 *
 */
function Carousel(){
    var self = this;
    var options = arguments[0] ? arguments[0] : {};
    this.options = {
        carouselBlock: null,        // класс или ID элемента блока карусели
        carouselWrapper: null,      // класс или ID обертки карусельных элементов
        carouselLeftBtn: null,      // класс или ID кнопки "влево"
        carouselRightBtn: null,     // класс или ID кнопки "вправо"
        carouselItem: null,         // класс или ID элемента карусели
        carouselStartItem: 0,       // индекс элемента, с которого начать отображение карусели
        carouselSpeed: 800,         // скорость анимации карусели
        carouselEasing: 'swing',     // эффект анимации карусел
        carouselBeforeScrollEvent: null,
        carouselAfterScrollEvent: null,
        vertical: false
    };
    $.extend(this.options, options);
    if(
        !this.options.carouselBlock
            || !this.options.carouselWrapper
            || !this.options.carouselLeftBtn
            || !this.options.carouselRightBtn
            || !this.options.carouselItem
        ) return false;

    var elements = {};
    elements.block = $(this.options.carouselBlock);
    elements.wrapper = $(this.options.carouselWrapper, elements.block);
    elements.leftBtn = $(this.options.carouselLeftBtn, elements.block);
    elements.rightBtn = $(this.options.carouselRightBtn, elements.block);

    if( $(elements.block).data('Carousel') ) return false;

    var properties = {
        itemIndex: this.options.carouselStartItem
    };

    properties.itemWidth = options.vertical ? $( this.options.carouselItem, elements.wrapper).eq(0).outerHeight( true ) : $( this.options.carouselItem, elements.wrapper).eq(0).outerWidth( true );
    properties.itemsCount = $( this.options.carouselItem, elements.wrapper).length;
    properties.blockWidth = properties.itemWidth * properties.itemsCount;
    properties.itemCountRotate = options.vertical ? Math.floor( $(elements.block).height() / properties.itemWidth ) : Math.floor( $(elements.block).width() / properties.itemWidth );
    properties.wrapperMargin = (-1)*(this.options.carouselStartItem * properties.itemWidth);

    this.rotate = function(inc){
        rotation = false;
        var margin = properties.wrapperMargin - inc * properties.itemCountRotate * properties.itemWidth;
        margin = (-1 * margin < 0 ) ? 0 : ((margin < -1 * properties.blockWidth) ? -1 * properties.blockWidth : margin);

        if( options.carouselBeforeScrollEvent && typeof options.carouselBeforeScrollEvent == 'function' ){
            options.carouselBeforeScrollEvent(properties);
        }

        var props = options.vertical ? {'marginTop': margin} : {'marginLeft': margin};
        $(elements.wrapper).animate(
            props,
            {
                duration: this.options.carouselSpeed
                , easing: this.options.carouselEasing
                , complete: function(){
                properties.itemIndex = properties.itemIndex + inc * properties.itemCountRotate;
                properties.wrapperMargin = margin;
                self.offBtns();
                rotation = true;

                if( options.carouselAfterScrollEvent && typeof options.carouselAfterScrollEvent == 'function' ){
                    options.carouselAfterScrollEvent(properties);
                }
            }
            }
        );
    };

    this.offBtns = function(){
        $(elements.leftBtn ).show();
        $(elements.rightBtn ).show();
        if( properties.itemIndex <= 0 ) $(elements.leftBtn ).hide();
        if( properties.itemIndex + properties.itemCountRotate >= properties.itemsCount ) $(elements.rightBtn ).hide();
    };

    var rotation = true;
    $(elements.leftBtn).click(function(e){
        if( rotation )
            self.rotate(-1);
    });
    $(elements.rightBtn).click(function(e){
        if( rotation )
            self.rotate(1);
    });
    self.offBtns();
    $(elements.wrapper).css({marginLeft: properties.wrapperMargin});

    $(elements.block).data('Carousel', this);
};


// 			Добавлено из common.js нужно переработать

// возвращает cookie если есть или undefined
function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    var str = '';
    if (matches && matches[1]) {
        try {
            str = decodeURIComponent(matches[1]);
        } catch(e) {
            str = unescape(matches[1]);
        }
    }
    return matches ? str : undefined;
};

// уcтанавливает cookie
/*
 props
 Объект с дополнительными свойствами для установки cookie:
 expires
 Время истечения cookie. Интерпретируется по-разному, в зависимости от типа:
 * Если число - количество секунд до истечения.
 * Если объект типа Date - точная дата истечения.
 * Если expires в прошлом, то cookie будет удалено.
 * Если expires отсутствует или равно 0, то cookie будет установлено как сессионное и исчезнет при закрытии браузера.
 path
 Путь для cookie.
 domain
 Домен для cookie.
 secure
 Пересылать cookie только по защищенному соединению.
 */
function setCookie(name, value, props) {
    props = props || {};
    var exp = props.expires;
    if (typeof exp == "number" && exp) {
        var d = new Date();
        d.setTime(d.getTime() + exp*1000);
        exp = props.expires = d;
    };
    if(exp && exp.toUTCString) {
        props.expires = exp.toUTCString()
    };

    value = encodeURIComponent(value);
    var updatedCookie = name + "=" + value;
    for(var propName in props) {
        updatedCookie += "; " + propName;
        var propValue = props[propName];
        if(propValue !== true) {
            updatedCookie += "=" + propValue;
        };
    };
    document.cookie = updatedCookie;
};

// удаляет cookie
function deleteCookie(name) {
    setCookie(name, null, { expires: -1 });
};

//Status bar
function init_status() {
    if (document.body.className != 'coupon-page') {
        /*
         $('#status div.status:not(.status-extend) div.close a').click(function(){
         $('#status, div.status').slideUp(500);
         if($.browser.msie && $.browser.version < 8) {
         $('#header').animate({height: '200px'}, 500);
         }
         if(location.hostname) setCookie('status', 'hide', {expires: 315360000, domain: '.' + location.hostname, path: '/'});
         else setCookie('status', 'hide', {expires: 315360000, path: '/'});
         return(false);
         });
         */

        /*
         $('#status div.status.status-extend div.close a').click(function(){
         $('#status, div.status').slideUp(500);
         if($.browser.msie && $.browser.version < 8) {
         $('#header').animate({height: '200px'}, 500);
         }
         if(location.hostname) setCookie('status_extend', 'hide', {expires: 315360000, domain: '.' + location.hostname, path: '/'});
         else setCookie('status_extend', 'hide', {expires: 315360000, path: '/'});
         return(false);
         });
         */
        if(getCookie('status_extend') != undefined && getCookie('status_extend') != 'hide') {
        }
        else if(getCookie('status') != 'hide') {
            show_status();
        }
    }
};

function show_status(c) {
    /*
     if(c) $('div.status:not(.status-extend) div.status-content').html(c);
     $('#status').slideDown(500);
     $('#status div.status:not(.status-extend)').appendTo('#header').slideDown(500);
     if($.browser.msie && $.browser.version < 8) {
     $('#header').animate({height: '277px'}, 500);
     }
     */
};

function show_status_extend(c) {
    /*
     if(c) $('div.status-extend div.status-content').html(c);
     $('#status').slideDown(500);
     $('#status div.status.status-extend').appendTo('#header').slideDown(500);
     if($.browser.msie && $.browser.version < 9) {
     $('#header').animate({height: '277px'}, 500);
     }
     */
};

//Check domain in blacklist
function check_domain(email) {
    result = $.ajax({
                        type: "POST",
                        url: "/",
                        dataType: "json",
                        async: false,
                        data:"action=check_domain&email="+email
                    }).responseText;
    data = JSON.parse(result);
    return data.success;
}

$(document).ready(function() {
    $('.top_submenu').prev().addClass('top_submenu_link').append('<div></div>');

    $('.multi_action_description .options_product .selectable').hover(
        function() {
            var width = $(this).width();
            var height = $(this).height();

            $(this).css({
                            'width' : (width -= 2) + 'px',
                            'height' : (height -= 2) + 'px',
                            'border' : '2px solid #E27B14',
                            'line-height' : '22px'
                        });
        },
        function() {
            var width = $(this).width();
            var height = $(this).height();

            $(this).css({
                            'width' : (width += 2) + 'px',
                            'height' : (height += 2) + 'px',
                            'border' : '1px solid #999',
                            'line-height' : '24px'
                        });
        }
    );

    $('#hiddenCnt0').on('keyup change', function(e) {
        var val = $(this).val();
        var key = e.which ? e.which : e.keyCode;

        if ( !(key in [ 8, 16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 46 ]) ) {
            if ( isNaN(val) || val == 0) {
                $(this).val(1);
            } else {
                if (val < 0) { $(this).val( -val ) }
            }
        }
    });

    $('iframe').each(function(){
        var url = $(this).attr("src");
        var wmode = url.indexOf('?') == -1 ? '?wmode=transparent' : '&wmode=transparent';
        $(this).attr("src",url+wmode);
    });

    var item = {
        gallery: {},
        rotateHndl: 0,
        defImg: '',
        current: 0,
        image: {},
        fade: {},
        pics: [],
        init: function(el) {
            var img = new Image;
            var pics = $('.mini-gallery img', el).get();
            this.gallery = $('.mini-gallery', el).get();
            this.image = $('.main', el).get()[0];
            this.fade = $('.fade', el).get()[0];
            this.defImg = this.image.getAttribute('src');

            for (var i = 0, len = pics.length; i < len; i++) {
                if ( $(pics[i]).attr('data-orig') ) {
                    $(pics[i]).attr('src', $(pics[i]).attr('data-orig')).removeAttr('data-orig');
                }
                this.pics.push(pics[i].getAttribute('data-big'));
            }
            for ( var i = 0, len = this.pics.length; i < len; i++) {
                img.src = this.pics[i];
            }
        },
        reset: function() {
            $(item.fade).stop();
            this.image.setAttribute('src', this.defImg);
            item.fade.style.display = 'none';
            this.fade.setAttribute('src', '');
            $('div', this.gallery).removeClass('active').first().addClass('active');
            this.defImg = '';
            this.current = 0;
            this.image = {};
            this.fade = {};
            this.pics = [];
        },
        switchImg: function(fade, id) {
            fade = fade == undefined ? true : fade;
            if(item.fade.tagName != 'IMG' && item.image.tagName != 'IMG') return false;

            if (fade) {
                if (item.current == item.pics.length - 1) { item.current = -1; }
                item.fade.setAttribute('src', item.pics[++item.current]);
                $('div', item.gallery).removeClass('active').eq(item.current).addClass('active');
                $(item.fade).fadeTo(1000, 1, function() {
                    item.image.setAttribute('src', item.pics[item.current]);
                    item.fade.style.display = 'none';
                });
            } else {
                this.current = id;
                $(item.fade).stop();
                this.image.setAttribute('src', this.pics[id]);
                item.fade.style.display = 'none';
                this.fade.setAttribute('src', this.pics[id]);
            }
        },
        rotateStart: function() { setTimeout(function() {item.switchImg(true)}, 200); this.rotateHndl = setInterval(item.switchImg, 1500); },
        rotateStop: function() { clearInterval(this.rotateHndl); }
    };

    if (!$('body').hasClass('mobile')) {

      $('#content').on({
        'mouseenter': function (e) {
          if (!$(this).hasClass('zoomThumbActive')) {

            $('div.thumb_zoom_icon0', $(this)).css('display', 'block')
          }
        }, 'mouseleave': function (e) {
          $('div.thumb_zoom_icon0', $(this)).css('display', 'none')
        }
      }, '.multi_left_side .multi_thumbs li a');

        $('#content').on({
            mouseenter: function (e) {
                item.init(this);
            },
            mouseleave: function () {
                item.reset();
            }
        }, '.action_item_v4.expand');


        $('#content').on({
            mouseenter: function (e) {
                $(this).addClass('border-block_hover');
            },
            mouseleave: function () {
                $(this).removeClass('border-block_hover');
            }
        }, '.action_item_v4.narrow.expand .border-block.prod');


        $('#content').on({
            mouseenter: function () {
                item.rotateStart();
            },
            mouseleave: function () {
                item.rotateStop();
            }
        }, '.prod .ai_img');

        $('#content').on({
            hover: function () {
                $(this).parent().find('div').removeClass('active');
                $(this).addClass('active');
                item.switchImg(false, this.getAttribute('data-id'));
            }
        }, '.mini-gallery div');
    }

    $('.ai_img .main').lazyload({
                                    effect   : 'fadeIn',
                                    threshold: 50,
                                    event    : 'scroll'
                                });
    $('body').on('click', '.ui-widget-overlay', function() {
        $('.ui-dialog .ui-dialog-content').dialog('close');
    });

    // изменение и восстановление цен на время акции "Черный понедельник"
    var showPromoPrices = $.cookie("show_promo_prices");
    if (showPromoPrices && false) {
        $('#wrapper, .menu_container').addClass('dark'); // затемнение фона

        var regexTech = /goods\/tech/;
        var regexFurn = /goods\/home\/furniture/;
        if (!regexTech.test(document.location.href) && !regexFurn.test(document.location.href)) {

            $('div.info-block').each(function(){
                var priceOriginal = $(this).find('div.ai_promo_original_price').text();
                var priceFinal = $(this).find('div.ai_promo_final_price').text();
                var pricePromo = $(this).find('div.ai_promo_price').text();
                if (priceOriginal && priceFinal && pricePromo && parseInt(pricePromo) < parseInt(priceFinal) && parseInt(pricePromo) > 1) {
                    var discountPromo = Math.round((priceOriginal - pricePromo) * 100 / priceOriginal);
                    $(this).find('div.ai_discount').html('-' + discountPromo + '<span>%</span>');
                    $(this).find('div.ai_discounted').html('<div class="ai_separator"></div>' + pricePromo + '<b style=" font-size: 26px; line-height: 10px; ">.</b>-');
                }
            });
        }
    }

});
//------------------------------------------------------счетчик для кнопки "Оплатить"

$(function(){

    $('.pay_order input.blue-button').click(function() {
        _gaq.push(['_trackEvent', 'pay', 'pay_button', 'pay_button_click']);
    })

});


//------------------------------------------------------счетчик для кнопки "Оплатить"


