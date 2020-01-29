/**
 * Created by vjmolina on 25/5/17.
 */

exports.fillTemplate = function fillTemplate() {
    var template = emptyTemplate();

    return template;
};
exports.fillUser = function fillUser() {
    var user = emptyUser();

    return user;
};
exports.fillTelResource = function fillTelResource() {
    var telRes = recursosTfnoTemplate();

    return telRes;
};
exports.fillRadioResource = function fillRadioResource() {
    var radioRes = recursosRadioTemplate();

    return radioRes;
};

function emptyTemplate() {
    var template =
    {
        "tipo": 1,
        "idConf": "",
        "fechaHora": "",
        "general": {
            "name": "",
            "emplazamiento": "",
            "dualidad": 1,
            "ipv": "",
            "ips": "",
            "nivelconsola": 0,
            "puertoconsola": 19710,
            "nivelIncidencias": 3,
            "cpus": [
                {
                    "tlan": 1,
                    "ip0": "",
                    "ms0": "",
                    "ip1": "",
                    "ms1": "",
                    "ipb": "",
                    "msb": "",
                    "ipg": ""
                },
                {
                    "tlan": 1,
                    "ip0": "",
                    "ms0": "",
                    "ip1": "",
                    "ms1": "",
                    "ipb": "",
                    "msb": "",
                    "ipg": ""
                }
            ],
            "dvrrp": 2000,
            "SupervisionLanGW": 0,
            "TmMaxSupervLanGW": 1
        },
        "hardware": {
            "slv": [
                {
                    "tp": 1,
                    "pos": [
                        {
                            "tp": 0,
                            "cfg": 0
                        },
                        {
                            "tp": 0,
                            "cfg": 0
                        },
                        {
                            "tp": 0,
                            "cfg": 0
                        },
                        {
                            "tp": 0,
                            "cfg": 0
                        }
                    ]
                },
                {
                    "tp": 1,
                    "pos": [
                        {
                            "tp": 0,
                            "cfg": 0
                        },
                        {
                            "tp": 0,
                            "cfg": 0
                        },
                        {
                            "tp": 0,
                            "cfg": 0
                        },
                        {
                            "tp": 0,
                            "cfg": 0
                        }
                    ]
                },
                {
                    "tp": 1,
                    "pos": [
                        {
                            "tp": 0,
                            "cfg": 0
                        },
                        {
                            "tp": 0,
                            "cfg": 0
                        },
                        {
                            "tp": 0,
                            "cfg": 0
                        },
                        {
                            "tp": 0,
                            "cfg": 0
                        }
                    ]
                },
                {
                    "tp": 1,
                    "pos": [
                        {
                            "tp": 0,
                            "cfg": 0
                        },
                        {
                            "tp": 0,
                            "cfg": 0
                        },
                        {
                            "tp": 0,
                            "cfg": 0
                        },
                        {
                            "tp": 0,
                            "cfg": 0
                        }
                    ]
                }
            ]
        },
        "recursos": [],
        "users": [],
        "servicios": {
            "name": "",
            "idSERVICIOS": 0,
            "sip": {
                "PuertoLocalSIP": 0,
                "KeepAlivePeriod": 200,
                "KeepAliveMultiplier": 10,
                "SupresionSilencio": 0,
                "PeriodoSupervisionSIP": 0,
                "proxys": [
                    {
                        "ip": "",
                        "selected": 0
                    },
                    {
                        "ip": "",
                        "selected": 0
                    }
                ],
                "registrars": [
                    {
                        "ip": "",
                        "selected": 0
                    },
                    {
                        "ip": "",
                        "selected": 0
                    }
                ]
            },
            "web": {
                "wport": 8080,
                "stime": 0
            },
            "snmp": {
                "agcomm": "public",
                "agcont": "NUCLEO-DF DT. MADRID. SPAIN",
                "agloc": "NUCLEO-DF LABS",
                "agname": "ULISESG5000i",
                "agv2": 1,
                "sport": 65001,
                "snmpp": 161,
                "traps": []
            },
            "grab": {
                "rtsp_ip": "",
                "rtspb_ip": "",
                "rtsp_port": 0,
                "rtsp_uri": "",
                "sport": 65001,
                "rtsp_rtp": 1,
                "rtp_pl": 8,
                "rtp_sr": 8000
            },
            "sincr": {
                "ntp": 2,
                "servidores": [
                    {
                        "ip": "",
                        "selected": 0
                    },
                    {
                        "ip": "",
                        "selected": 0
                    }
                ]
            }
        }
    };
    return template;
}

function recursosRadioTemplate() {
    var recursoRadioTemplate =
    {
        "IdRecurso": "",
        "Radio_o_Telefonia": 1,
        "SlotPasarela": 0,
        "NumDispositivoSlot": 0,
        "TamRTP": 0,
        "Codec": 0,
        "Uri_Local": "",
        "enableRegistro": 0,
        "szClave": "",
        "Buffer_jitter": {
            "min": 0,
            "max": 0
        },
        "hardware": {
            "AD_AGC": 0,
            "AD_Gain": 0,
            "DA_AGC": 0,
            "DA_Gain": 0
        },
        "radio": {
            "tipo": 0,
            "sq": 0,
            "ptt": 0,
            "bss": 0,
            "modoConfPtt": 1,
            "repSqBss": 1,
            "desactivacionSq": 0,
            "timeoutPtt": 200,
            "metodoBss": 0,
            "umbralVad": 0,
            "numFlujosAudio": 1,
            "tiempoPtt": 0,
            "tmVentanaRx": 0,
            "climaxDelay": 1,
            "tmRetardoFijo": 0,
            "bssRtp": 0,
            "retrasoSqOff": 0,
            "evtPTT": 0,
            "tjbd": 0,
            "tGRSid": 0,
            "iEnableGI": 0,
            "tabla_indices_calidad": [],
            "iSesionPrio": 0,
            "iPttPrio": 0,
            "colateral": {
                "name": "",
                "tipoConmutacion": 0,
                "emplazamientos": [
                    {
                        "activoTx": 0,
                        "activoRx": 0,
                        "uriTxA": "",
                        "uriTxB": "",
                        "uriRxA": "",
                        "uriRxB": ""
                    },
                    {
                        "activoTx": 0,
                        "activoRx": 0,
                        "uriTxA": "",
                        "uriTxB": "",
                        "uriRxA": "",
                        "uriRxB": ""
                    },
                    {
                        "activoTx": 0,
                        "activoRx": 0,
                        "uriTxA": "",
                        "uriTxB": "",
                        "uriRxA": "",
                        "uriRxB": ""
                    }
                ]
            },
            "iPrecisionAudio": 0,
            "iModoCalculoClimax": 0,
            "FrqTonoSQ": -1,
            "UmbralTonoSQ": -1,
            "FrqTonoPTT": -1,
            "UmbralTonoPTT": -1,
            "SupervPortadoraTx": -1,
            "SupervModuladoraTx": -1
        },
        "telefonia": {
            "tipo": 0,
            "lado": 1,
            "t_eym": 0,
            "h2h4": 0,
            "ladoeym": 0,
            "modo": 0,
            "r_automatica": 1,
            "no_test_local": "",
            "no_test_remoto": "",
            "it_release": 5,
            "uri_remota": "",
            "detect_vox": 1,
            "umbral_vox": -20,
            "tm_inactividad": 2,
            "superv_options": 1,
            "tm_superv_options": 5,
            "colateral_scv": 0,
            "ats_rangos_dst": [
                {
                    "inicial": "",
                    "final": ""
                },
                {
                    "inicial": "",
                    "final": ""
                },
                {
                    "inicial": "",
                    "final": ""
                },
                {
                    "inicial": "",
                    "final": ""
                }
            ],
            "ats_rangos_org": [
                {
                    "inicial": "",
                    "final": ""
                },
                {
                    "inicial": "",
                    "final": ""
                },
                {
                    "inicial": "",
                    "final": ""
                },
                {
                    "inicial": "",
                    "final": ""
                }
            ],
            "iT_Int_Warning": 5,
            
            "iTmLlamEntrante": 30,
            "iTmDetFinLlamada": 6,
            "TReleaseBL": 3,
            "iDetCallerId": 0,
            "iTmCallerId": 3000,
            "iDetInversionPol": 1,
            "iPeriodoSpvRing": 200,
             "iFiltroSpvRing": 2,
            "iDetDtmf": 0,
            
            "idRed": "",
            "idTroncal": "",
            "listaEnlacesInternos": [],
            "ats_rangos_operador": [],
            "ats_rangos_privilegiados": [],
            "ats_rangos_directos_ope": [],
            "ats_rangos_directos_pri": []
        },
        "LlamadaAutomatica": 0,
        "restriccion": 0,
        "blanca": [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
        ],
        "negra": [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
        ],
        "iFlgUsarDiffServ": 0,
        "szDestino": ""
    };
    return recursoRadioTemplate;
}

function recursosTfnoTemplate() {
    var recursoTfnoTemplate =
    {
        "IdRecurso": "LR2",
        "Radio_o_Telefonia": 2,
        "SlotPasarela": 0,
        "NumDispositivoSlot": 0,
        "TamRTP": 0,
        "Codec": 0,
        "Uri_Local": "",
        "enableRegistro": 0,
        "szClave": "",
        "Buffer_jitter": {
            "min": 0,
            "max": 0
        },
        "hardware": {
            "AD_AGC": 0,
            "AD_Gain": 0,
            "DA_AGC": 0,
            "DA_Gain": 0
        },
        "radio": {
            "tipo": 0,
            "sq": 0,
            "ptt": 0,
            "bss": 0,
            "modoConfPtt": 0,
            "repSqBss": 1,
            "desactivacionSq": 1,
            "timeoutPtt": 200,
            "metodoBss": 0,
            "umbralVad": 0,
            "numFlujosAudio": 1,
            "tiempoPtt": 0,
            "tmVentanaRx": 100,
            "climaxDelay": 0,
            "tmRetardoFijo": 0,
            "bssRtp": 0,
            "retrasoSqOff": 10,
            "evtPTT": 0,
            "tjbd": 0,
            "tGRSid": 0,
            "iEnableGI": 0,
            "tabla_indices_calidad": [],
            "iSesionPrio": 0,
            "iPttPrio": 0,
            "colateral": {
                "name": "",
                "tipoConmutacion": 0,
                "emplazamientos": [
                    {
                        "activoTx": 0,
                        "activoRx": 0,
                        "uriTxA": "",
                        "uriTxB": "",
                        "uriRxA": "",
                        "uriRxB": ""
                    },
                    {
                        "activoTx": 0,
                        "activoRx": 0,
                        "uriTxA": "",
                        "uriTxB": "",
                        "uriRxA": "",
                        "uriRxB": ""
                    },
                    {
                        "activoTx": 0,
                        "activoRx": 0,
                        "uriTxA": "",
                        "uriTxB": "",
                        "uriRxA": "",
                        "uriRxB": ""
                    }
                ]
            },
            "iPrecisionAudio": 1,
            "iModoCalculoClimax": 0,
            "FrqTonoSQ": -1,
            "UmbralTonoSQ": -1,
            "FrqTonoPTT": -1,
            "UmbralTonoPTT": -1,
            "SupervPortadoraTx": -1,
            "SupervModuladoraTx": -1
        },
        "telefonia": {
            "tipo": 0,
            "lado": 0,
            "t_eym": 0,
            "h2h4": 0,
            "ladoeym": 0,
            "modo": 0,
            "r_automatica": 0,
            "no_test_local": "",
            "no_test_remoto": "",
            "it_release": 0,
            "uri_remota": "",
            "detect_vox": 0,
            "umbral_vox": 0,
            "tm_inactividad": 0,
            "superv_options": 0,
            "tm_superv_options": 0,
            "colateral_scv": 0,
            "ats_rangos_dst": [
                {
                    "inicial": "",
                    "final": ""
                },
                {
                    "inicial": "",
                    "final": ""
                },
                {
                    "inicial": "",
                    "final": ""
                },
                {
                    "inicial": "",
                    "final": ""
                }
            ],
            "ats_rangos_org": [
                {
                    "inicial": "",
                    "final": ""
                },
                {
                    "inicial": "",
                    "final": ""
                },
                {
                    "inicial": "",
                    "final": ""
                },
                {
                    "inicial": "",
                    "final": ""
                }
            ],
            "iT_Int_Warning": 0,

            "iTmLlamEntrante": 30,
            "iTmDetFinLlamada": 6,
            "TReleaseBL": 3,
            "iDetCallerId": 0,
            "iTmCallerId": 3000,
            "iDetInversionPol": 1,
            "iPeriodoSpvRing": 200,
             "iFiltroSpvRing": 2,
            "iDetDtmf": 0,

            "idRed": "",
            "idTroncal": "",
            "listaEnlacesInternos": [],
            "ats_rangos_operador": [],
            "ats_rangos_privilegiados": [],
            "ats_rangos_directos_ope": [],
            "ats_rangos_directos_pri": []
        },
        "LlamadaAutomatica": 0,
        "restriccion": 0,
        "blanca": [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
        ],
        "negra": [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
        ],
        "iFlgUsarDiffServ": 0,
        "szDestino": ""
    };
    return recursoTfnoTemplate;
}

function emptyUser() {
    var user =
    {
        "name": "",
        "clave": "",
        "perfil": 0
    };
    return user;
}
