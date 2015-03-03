var Dictionary = {
    words:{},
    add: function(obj){
        for( key in obj )
            this.words[key] = obj[key];
    },
    translate: function(key){
        return (this.words[key] !== undefined) ? this.words[key] : key;
    }
};

Dictionary.add({
    'lang_check_nonempty': 'Не заполнено обязательное поле',
    'lang_check_int': 'Неверный формат целого числа',
    'lang_check_float': 'Неверный формат числа с плавающей точкой',
    'lang_check_email': 'Неверный формат email',
    'lang_check_login': 'Неверный формат (строка из цифр или латинских букв без пробелов)',
    'lang_check_alphastring': 'Неверный формат (строка из латинских букв)',
    'lang_check_date': 'Неверный формат даты (DD.MM.YYYY)',
    'lang_check_time': 'Неверный формат времени (HH:MM)',
    'lang_check_datetime': 'Неверный формат даты/времени (DD.MM.YYYY HH:MM)',
    'lang_check_datetime_full': 'Неверный формат даты/времени (DD.MM.YYYY HH:MM:SS)',
    'lang_check_no_variant': 'Не выбран ни один из вариантов',
    'lang_check_count6': 'Пароль должен быть не менее 6 символов',
    'lang_check_preg': 'Данные введены неверно',
    'lang_check_nopreg': 'Данные введены неверно'
});
