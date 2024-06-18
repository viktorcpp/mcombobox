
export default class MCombobox
{
    constructor()
    {
        this.options                    = {};
        this.options.max_menu_items     = 5;
        this.options.sel_main           = "select";

        this.options.cls_fake_main      = "select-fake";
        this.options.cls_fake_label     = "select-label";
        this.options.cls_fake_btn       = "select-button";
        this.options.cls_fake_menu_hold = "select-fake-menu-holder";
        this.options.cls_fake_menu      = "select-fake-menu";
        this.options.cls_fake_menu_item = "select-fake-menu-item";
        this.options.cls_fake_opened    = "opened";
        this.options.cls_fake_selected  = "selected";
        this.options.cls_fake_open_up   = "open-up";
        this.options.cls_processed      = "processed";

        document.mcbox_opened = [];

        window.mcombobox = this;
    }

    Init( new_options = null )
    {
        this.options = Object.assign( this.options, new_options || this.options );

        let _select_list = Array.from( document.querySelectorAll( this.options.sel_main + ":not(." + this.options.cls_processed + ")" ) );
        if( _select_list.length < 1 ) return;

        _select_list.forEach((_el)=>{
            this._CreateSelect( _el );
        });

        window.addEventListener( "resize", this._OnResize );

    }

    _CreateSelect( select )
    {
        let _obj                = Object.create(null);
            _obj.onhide_timeout = null;
            _obj.select         = select;

            _obj.select.classList.add( this.options.cls_processed );
            // main
            _obj.main           = document.createElement("div");
            _obj.main_label     = document.createElement("div");
            _obj.main_btn       = document.createElement("div");

            _obj.main      .classList.add(this.options.cls_fake_main);
            _obj.main_label.classList.add(this.options.cls_fake_label);
            _obj.main_btn  .classList.add(this.options.cls_fake_btn);

            _obj.main.appendChild( _obj.main_label );
            _obj.main.appendChild( _obj.main_btn );

            _obj.main_label.innerText = select.options[0].innerText;

            // menu
            _obj.menu_hold = document.createElement("div");
            _obj.menu      = document.createElement("div");

            _obj.menu_hold.classList.add(this.options.cls_fake_menu_hold);
            _obj.menu.classList.add(this.options.cls_fake_menu);

            _obj.menu_hold.appendChild(_obj.menu);

        // options
        for( let x = 0; x < select.options.length; x++ )
        {
            let _option = document.createElement("div");
                _option.setAttribute( "value", select.options[x].value );
                _option.setAttribute( "index", x );
                _option.classList.add( this.options.cls_fake_menu_item );
                _option.innerText = select.options[x].innerText;

            _obj.menu.appendChild(_option);

            _option.addEventListener( "click", this._OnMenuItemTap.call( this, _obj ) );

        }

        document.body.appendChild(_obj.menu_hold);

        let _max_height = this.options.max_menu_items * _obj.menu.getElementsByClassName( this.options.cls_fake_menu_item )[0].offsetHeight;

        _obj.menu_max_height = _max_height;

        select.parentElement.appendChild(_obj.main);

        _obj.main.addEventListener( "click", this._OnMainTap.call( this, _obj ) );

        _obj.main.obj_mcombobox = _obj;
        select.obj_mcombobox    = _obj;

        select.addEventListener( "change", this._OnSelectChange );

        _obj.menu.childNodes[select.selectedIndex].classList.add( this.options.cls_fake_selected );
        _obj.main_label.innerText = _obj.menu.childNodes[select.selectedIndex].innerText;

    }

    _OnSelectChange(e)
    {
        let _obj  = this.obj_mcombobox;
        let _self = window.mcombobox;

        Array.from( _obj.menu.childNodes ).forEach((_el)=>{
            _el.classList.remove( _self.options.cls_fake_selected );
        });

        _obj.menu.childNodes[this.selectedIndex].classList.add( _self.options.cls_fake_selected );

        _obj.main_label.innerText = _obj.menu.childNodes[this.selectedIndex].innerText;

        _obj.menu.scrollTop = _obj.menu.childNodes[0].offsetHeight * this.selectedIndex;

    }

    _OnMainTap( _obj ) {
        return (e)=> {
            e.stopPropagation();

            _obj.main.classList.toggle( this.options.cls_fake_opened );

            let _max_top = document.documentElement.scrollTop + window.innerHeight;

            if( _obj.main.classList.contains( this.options.cls_fake_opened ) )
            {
                let _offset = _obj.main.getBoundingClientRect();
                let _left   = _offset.left;
                let _top    = _offset.top  + _obj.main.offsetHeight + window.scrollY;

                if( _top + _obj.menu.offsetHeight > _max_top )
                {
                    _obj.menu_hold.classList.add( this.options.cls_fake_open_up );
                    _top -= _obj.main.offsetHeight;
                }

                _obj.menu_hold.style["left"]       = _left + "px";
                _obj.menu_hold.style["top"]        = _top  + "px";
                _obj.menu     .style["max-height"] = _obj.menu_max_height + "px";

                document.mcbox_opened.push( _obj );

                document.addEventListener( "click", this._OnBodyTap );

                _obj.menu_hold.style["width"] = _obj.main.getBoundingClientRect().width + 'px';
            }
            else
            {
                _obj.menu_hold.style["left"]       = "-9999px";
                _obj.menu_hold.style["top"]        = "-9999px";
                _obj.menu     .style["max-height"] = 0;

                document.mcbox_opened.splice( document.mcbox_opened.indexOf(_obj), 1 );
            }
        }
    }

    _OnMenuItemTap( _obj ) {
        return (e)=> {
            e.stopPropagation();

            let _self = window.mcombobox;

            _obj.main.classList.remove( this.options.cls_fake_opened );

            _obj.menu_hold.style["left"]       = "-9999px";
            _obj.menu_hold.style["top"]        = "-9999px";
            _obj.menu     .style["max-height"] = 0;

            _obj.main_label.innerText = e.target.innerText;

            document.removeEventListener( "click", _self._OnBodyTap );

            document.mcbox_opened.splice( document.mcbox_opened.indexOf(_obj), 1 );

            _obj.select.selectedIndex = e.target.attributes["index"].value;

            Array.from( e.target.parentElement.childNodes ).forEach((_el)=>{
                _el.classList.remove( _self.options.cls_fake_selected );
            });

            e.target.classList.add( _self.options.cls_fake_selected );
        }
    }

    _OnBodyTap(e) {
        e.preventDefault();

        if( e.currentTarget.classList != null )
            if( e.currentTarget.classList.contains( window.mcombobox.options.cls_fake_main ) ||
                e.currentTarget.classList.contains( window.mcombobox.options.cls_fake_label ) ||
                e.currentTarget.classList.contains( window.mcombobox.options.cls_fake_btn ) ) return;

        clearTimeout( window.mcombobox.options.onhide_timeout );

        window.mcombobox.options.onhide_timeout = setTimeout( ()=>{ window.mcombobox._OnBodyTap_Impl(); }, 25 );
    }

    _OnBodyTap_Impl() {
        if( document.mcbox_opened.length < 1 ) return;
        let _self = window.mcombobox;

        document.mcbox_opened.forEach((_obj)=>{
            _obj.menu_hold.style["left"]       = "-9999px";
            _obj.menu_hold.style["top"]        = "-9999px";
            _obj.menu_hold.style["max-height"] = 0;

            _obj.main.classList.remove( _self.options.cls_fake_opened );

            document.mcbox_opened.splice( document.mcbox_opened.indexOf(_obj), 1 );
        });

        document.removeEventListener( "click", this._OnBodyTap );
    }

    _OnResize()
    {
        let _self = window.mcombobox;

        document.mcbox_opened.forEach((_obj)=>{

            _obj.main.classList.remove( _self.options.cls_fake_opened );

            _obj.menu_hold.style["left"]       = "-9999px";
            _obj.menu_hold.style["top"]        = "-9999px";
            _obj.menu     .style["max-height"] = 0;

            document.removeEventListener( "click", _self._OnBodyTap );

            document.mcbox_opened.splice( document.mcbox_opened.indexOf(_obj), 1 );
        });
    }

    _OverrideOptions( new_options = null )
    {
        this.options = Object.assign( {}, new_options );
    }
}
