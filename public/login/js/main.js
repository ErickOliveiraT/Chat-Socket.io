(function ($) {
    "use strict";

    /*==================================================================
    [ Focus input ]*/
    $('.input100').each(function () {
        $(this).on('blur', function () {
            if ($(this).val().trim() != "") {
                $(this).addClass('has-val');
            }
            else {
                $(this).removeClass('has-val');
            }
        })
    })

    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');
    

    $('.validate-form').on('submit', function (e) {
        e.preventDefault();
        console.log('Email: ', input[0].value);
        console.log('Senha: ', input[1].value);
        //Autenticação:
        var data = {
            login: input[0].value,
            password: input[1].value
        }
        fetch("http://localhost:4000/authenticate", {
          "method": "POST",
          "headers": {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*"
          },
          "body": JSON.stringify(data)
        })
        .then((res) => {
            return res.json();
        })
        .then((json) => {
            if (json.token) {
                localStorage.setItem('token', json.token);
                localStorage.setItem('logged_user_email', input[0].value);
                localStorage.setItem('logged_user_name', json.name);
            }
            if (json.valid) window.location.href = 'http://localhost:4000';
            else showValidate(input[1]);
        })
        .catch((err) => {
            console.log(err);
        })
    });

    $('.validate-form .input100').each(function () {
        $(this).focus(function () {
            hideValidate(this);
        });
    });

    function validate(input) {
        if ($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if ($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if ($(input).val().trim() == '') {
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();
        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();
        $(thisAlert).removeClass('alert-validate');
    }

    /*==================================================================
    [ Show pass ]*/
    var showPass = 0;
    $('.btn-show-pass').on('click', function () {
        if (showPass == 0) {
            $(this).next('input').attr('type', 'text');
            $(this).find('i').removeClass('zmdi-eye');
            $(this).find('i').addClass('zmdi-eye-off');
            showPass = 1;
        }
        else {
            $(this).next('input').attr('type', 'password');
            $(this).find('i').addClass('zmdi-eye');
            $(this).find('i').removeClass('zmdi-eye-off');
            showPass = 0;
        }
    });
})(jQuery);