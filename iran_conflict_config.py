# Iran Conflict Tracking Configuration
# Comprehensive setup for tracking politicians, media outlets, and reporters

IRAN_CONFLICT_CONFIG = {
    'issue_id': 'iran-conflict-2024',
    'name': 'Iran-Israel Conflict Analysis',
    'description': 'Comprehensive tracking of political positions, media coverage, and rhetoric patterns',
    
    'politicians': {
        'pro-israel': [
            {
                'id': 'netanyahu',
                'name': 'Benjamin Netanyahu',
                'title': 'Prime Minister of Israel',
                'country': 'Israel',
                'role': 'Head of Government',
                'keywords': ['security', 'defense', 'terrorism', 'nuclear threat']
            },
            {
                'id': 'gantz',
                'name': 'Benny Gantz',
                'title': 'Minister of Defense',
                'country': 'Israel',
                'role': 'Defense Minister',
                'keywords': ['military strategy', 'deterrence', 'regional stability']
            },
            {
                'id': 'herzog',
                'name': 'Isaac Herzog',
                'title': 'President of Israel',
                'country': 'Israel',
                'role': 'Head of State',
                'keywords': ['diplomacy', 'international relations', 'peace efforts']
            },
            {
                'id': 'biden',
                'name': 'Joe Biden',
                'title': 'President of the United States',
                'country': 'USA',
                'role': 'US President',
                'keywords': ['support for Israel', 'Middle East policy', 'security guarantees']
            },
            {
                'id': 'blinken',
                'name': 'Antony Blinken',
                'title': 'US Secretary of State',
                'country': 'USA',
                'role': 'Diplomat',
                'keywords': ['ceasefire negotiations', 'hostage deals', 'regional diplomacy']
            },
            {
                'id': 'austin',
                'name': 'Lloyd Austin',
                'title': 'US Secretary of Defense',
                'country': 'USA',
                'role': 'Defense Secretary',
                'keywords': ['military aid', 'defense cooperation', 'deterrence']
            },
            {
                'id': 'sunak',
                'name': 'Rishi Sunak',
                'title': 'Prime Minister of the UK',
                'country': 'UK',
                'role': 'UK Prime Minister',
                'keywords': ['Israel support', 'two-state solution', 'humanitarian concerns']
            },
            {
                'id': 'macron',
                'name': 'Emmanuel Macron',
                'title': 'President of France',
                'country': 'France',
                'role': 'French President',
                'keywords': ['balanced approach', 'ceasefire calls', 'hostage release']
            },
            {
                'id': 'scholz',
                'name': 'Olaf Scholz',
                'title': 'Chancellor of Germany',
                'country': 'Germany',
                'role': 'German Chancellor',
                'keywords': ['Israel security', 'historical responsibility', 'humanitarian aid']
            },
            {
                'id': 'trudeau',
                'name': 'Justin Trudeau',
                'title': 'Prime Minister of Canada',
                'country': 'Canada',
                'role': 'Canadian Prime Minister',
                'keywords': ['balanced stance', 'ceasefire support', 'human rights']
            }
        ],
        
        'pro-iran': [
            {
                'id': 'khamenei',
                'name': 'Ali Khamenei',
                'title': 'Supreme Leader of Iran',
                'country': 'Iran',
                'role': 'Supreme Leader',
                'keywords': ['resistance axis', 'Israel destruction', 'nuclear program', 'regional influence']
            },
            {
                'id': 'raisi',
                'name': 'Ebrahim Raisi',
                'title': 'President of Iran',
                'country': 'Iran',
                'role': 'President',
                'keywords': ['economic resistance', 'sanctions evasion', 'military support']
            },
            {
                'id': 'amir-abdollahian',
                'name': 'Hossein Amir-Abdollahian',
                'title': 'Foreign Minister of Iran',
                'country': 'Iran',
                'role': 'Foreign Minister',
                'keywords': ['diplomatic relations', 'nuclear negotiations', 'regional alliances']
            },
            {
                'id': 'nasrallah',
                'name': 'Hassan Nasrallah',
                'title': 'Secretary-General of Hezbollah',
                'country': 'Lebanon',
                'role': 'Hezbollah Leader',
                'keywords': ['resistance', 'Israel threats', 'military readiness', 'regional coordination']
            },
            {
                'id': 'houthi',
                'name': 'Abdul-Malik al-Houthi',
                'title': 'Leader of Ansar Allah (Houthi)',
                'country': 'Yemen',
                'role': 'Houthi Leader',
                'keywords': ['Israel support for enemies', 'maritime attacks', 'regional conflict']
            },
            {
                'id': 'assad',
                'name': 'Bashar al-Assad',
                'title': 'President of Syria',
                'country': 'Syria',
                'role': 'Syrian President',
                'keywords': ['Israel occupation', 'Golan Heights', 'resistance support']
            },
            {
                'id': 'putin',
                'name': 'Vladimir Putin',
                'title': 'President of Russia',
                'country': 'Russia',
                'role': 'Russian President',
                'keywords': ['Israel criticism', 'Iran support', 'balanced diplomacy', 'arms sales']
            },
            {
                'id': 'xi',
                'name': 'Xi Jinping',
                'title': 'President of China',
                'country': 'China',
                'role': 'Chinese President',
                'keywords': ['neutral stance', 'ceasefire calls', 'economic interests', 'diplomatic balance']
            },
            {
                'id': 'modi',
                'name': 'Narendra Modi',
                'title': 'Prime Minister of India',
                'country': 'India',
                'role': 'Indian Prime Minister',
                'keywords': ['balanced approach', 'Israel relations', 'Iran oil', 'diplomatic neutrality']
            },
            {
                'id': 'erdogan',
                'name': 'Recep Tayyip Erdoğan',
                'title': 'President of Turkey',
                'country': 'Turkey',
                'role': 'Turkish President',
                'keywords': ['Israel criticism', 'Palestinian support', 'Hamas relations', 'regional influence']
            }
        ],
        
        'neutral-unknown': [
            {
                'id': 'guterres',
                'name': 'António Guterres',
                'title': 'UN Secretary-General',
                'country': 'United Nations',
                'role': 'UN Leader',
                'keywords': ['ceasefire calls', 'humanitarian aid', 'neutral mediation']
            },
            {
                'id': 'borrell',
                'name': 'Josep Borrell',
                'title': 'EU Foreign Policy Chief',
                'country': 'European Union',
                'role': 'EU Diplomat',
                'keywords': ['balanced approach', 'ceasefire efforts', 'humanitarian concerns']
            }
        ]
    },
    
    'media_outlets': {
        'pro-israel': [
            {
                'name': 'The Jerusalem Post',
                'country': 'Israel',
                'bias': 'pro-Israel',
                'website': 'https://www.jpost.com',
                'reporters': [
                    {
                        'name': 'Lahav Harkov',
                        'title': 'Senior Contributing Editor',
                        'beat': 'Politics, Diplomacy',
                        'twitter': '@LahavHarkov'
                    },
                    {
                        'name': 'Tovah Lazaroff',
                        'title': 'Deputy Managing Editor',
                        'beat': 'Diplomacy, US-Israel relations',
                        'twitter': '@TovahLazaroff'
                    },
                    {
                        'name': 'Anna Ahronheim',
                        'title': 'Military and Defense Correspondent',
                        'beat': 'Security, Military affairs',
                        'twitter': '@AAhronheim'
                    },
                    {
                        'name': 'Yonah Jeremy Bob',
                        'title': 'Legal Affairs Correspondent',
                        'beat': 'Justice, Legal issues',
                        'twitter': '@yonahbob'
                    },
                    {
                        'name': 'Khouloud Khayat',
                        'title': 'Arab Affairs Correspondent',
                        'beat': 'Arab-Israeli relations',
                        'twitter': '@khouloud_khayat'
                    }
                ]
            },
            {
                'name': 'The Times of Israel',
                'country': 'Israel',
                'bias': 'pro-Israel',
                'website': 'https://www.timesofisrael.com',
                'reporters': [
                    {
                        'name': 'Raanan Elir',
                        'title': 'Political Correspondent',
                        'beat': 'Israeli politics',
                        'twitter': '@RaananElir'
                    },
                    {
                        'name': 'Amanda Borschel-Dan',
                        'title': 'Archaeology and Jewish World Editor',
                        'beat': 'Culture, History',
                        'twitter': '@AmandaBorschel'
                    },
                    {
                        'name': 'Emanuel Fabian',
                        'title': 'Military Correspondent',
                        'beat': 'Security, Defense',
                        'twitter': '@EmanuelFabian'
                    },
                    {
                        'name': 'Jacob Magid',
                        'title': 'US Correspondent',
                        'beat': 'US-Israel relations',
                        'twitter': '@JacobMagid'
                    },
                    {
                        'name': 'Aaron Boxerman',
                        'title': 'Arab Affairs Correspondent',
                        'beat': 'Palestinian affairs',
                        'twitter': '@AaronBoxerman'
                    }
                ]
            },
            {
                'name': 'Israel Hayom',
                'country': 'Israel',
                'bias': 'pro-Israel',
                'website': 'https://www.israelhayom.com',
                'reporters': [
                    {
                        'name': 'Ariel Kahana',
                        'title': 'Political Correspondent',
                        'beat': 'Government, Politics',
                        'twitter': '@arielkahananew'
                    },
                    {
                        'name': 'Mati Tuchfeld',
                        'title': 'Senior Analyst',
                        'beat': 'Middle East affairs',
                        'twitter': '@MatiTuchfeld'
                    },
                    {
                        'name': 'Yisrael Cohen',
                        'title': 'Defense Correspondent',
                        'beat': 'Military, Security',
                        'twitter': '@yisraelcohen'
                    },
                    {
                        'name': 'Dan Lavie',
                        'title': 'Arab Affairs Correspondent',
                        'beat': 'Regional diplomacy',
                        'twitter': '@danlavie'
                    },
                    {
                        'name': 'Lilach Shoval',
                        'title': 'Diplomatic Correspondent',
                        'beat': 'International relations',
                        'twitter': '@lilachshoval'
                    }
                ]
            }
        ],
        
        'pro-iran': [
            {
                'name': 'Press TV',
                'country': 'Iran',
                'bias': 'pro-Iran',
                'website': 'https://www.presstv.ir',
                'reporters': [
                    {
                        'name': 'Marzieh Hashemi',
                        'title': 'Senior Anchor',
                        'beat': 'Middle East politics',
                        'twitter': '@MarziehHashemi'
                    },
                    {
                        'name': 'Yvonne Ridley',
                        'title': 'Journalist',
                        'beat': 'Western affairs',
                        'twitter': '@yvonneridley'
                    },
                    {
                        'name': 'Richard Medhurst',
                        'title': 'Correspondent',
                        'beat': 'International relations',
                        'twitter': '@richimedhurst'
                    },
                    {
                        'name': 'Syed Mohammad Marandi',
                        'title': 'Analyst',
                        'beat': 'Iranian politics',
                        'twitter': '@s_m_marandi'
                    },
                    {
                        'name': 'Catherine Shakdam',
                        'title': 'Political Analyst',
                        'beat': 'Middle East analysis',
                        'twitter': '@ShakdamC'
                    }
                ]
            },
            {
                'name': 'Al Mayadeen',
                'country': 'Lebanon',
                'bias': 'pro-Iran',
                'website': 'https://www.almayadeen.net',
                'reporters': [
                    {
                        'name': 'Ghassan Ben Jeddou',
                        'title': 'Founder and Director',
                        'beat': 'Regional politics',
                        'twitter': '@ghassanbj'
                    },
                    {
                        'name': 'Wassim Nasr',
                        'title': 'Senior Correspondent',
                        'beat': 'Terrorism, Security',
                        'twitter': '@SimNasr'
                    },
                    {
                        'name': 'Ali Hashem',
                        'title': 'Chief Correspondent',
                        'beat': 'Middle East conflicts',
                        'twitter': '@alihashem_tv'
                    },
                    {
                        'name': 'Joy Hyder',
                        'title': 'Correspondent',
                        'beat': 'International affairs',
                        'twitter': '@JoyHyder'
                    },
                    {
                        'name': 'Zeina Khodr',
                        'title': 'Senior Correspondent',
                        'beat': 'Regional analysis',
                        'twitter': '@ZeinaKhodrAljaz'
                    }
                ]
            },
            {
                'name': 'Tasnim News Agency',
                'country': 'Iran',
                'bias': 'pro-Iran',
                'website': 'https://www.tasnimnews.com',
                'reporters': [
                    {
                        'name': 'Mohammad Ghaderi',
                        'title': 'Editor-in-Chief',
                        'beat': 'Iranian politics',
                        'twitter': '@ghaderi_mohammad'
                    },
                    {
                        'name': 'Sadegh Zibakalam',
                        'title': 'Political Analyst',
                        'beat': 'Domestic affairs',
                        'twitter': '@zibakalam'
                    },
                    {
                        'name': 'Hamid Reza Moghaddamfar',
                        'title': 'International Affairs Editor',
                        'beat': 'Foreign policy',
                        'twitter': '@moghaddamfar'
                    },
                    {
                        'name': 'Javad Heiran-Nia',
                        'title': 'Defense Analyst',
                        'beat': 'Military affairs',
                        'twitter': '@jheidarnia'
                    },
                    {
                        'name': 'Mohsen Paknejad',
                        'title': 'Economic Editor',
                        'beat': 'Sanctions, Economy',
                        'twitter': '@paknejad_mohsen'
                    }
                ]
            }
        ],
        
        'neutral': [
            {
                'name': 'Reuters',
                'country': 'UK',
                'bias': 'neutral',
                'website': 'https://www.reuters.com',
                'reporters': [
                    {
                        'name': 'Jeff Mason',
                        'title': 'White House Correspondent',
                        'beat': 'US politics',
                        'twitter': '@jeffmason1'
                    },
                    {
                        'name': 'Steve Holland',
                        'title': 'White House Correspondent',
                        'beat': 'Presidential coverage',
                        'twitter': '@steveholland1'
                    },
                    {
                        'name': 'Michelle Nichols',
                        'title': 'United Nations Correspondent',
                        'beat': 'International diplomacy',
                        'twitter': '@michnichols'
                    },
                    {
                        'name': 'Nandita Bose',
                        'title': 'White House Correspondent',
                        'beat': 'Economic policy',
                        'twitter': '@Nandita_Bose'
                    },
                    {
                        'name': 'Humeyra Pamuk',
                        'title': 'Diplomatic Correspondent',
                        'beat': 'Foreign affairs',
                        'twitter': '@humeyra_pamuk'
                    }
                ]
            },
            {
                'name': 'Associated Press',
                'country': 'USA',
                'bias': 'neutral',
                'website': 'https://www.ap.org',
                'reporters': [
                    {
                        'name': 'Aamer Madhani',
                        'title': 'White House Correspondent',
                        'beat': 'US foreign policy',
                        'twitter': '@aamermadhani'
                    },
                    {
                        'name': 'Zeinab El-Gundy',
                        'title': 'Middle East Correspondent',
                        'beat': 'Regional conflicts',
                        'twitter': '@ZeinabElGundy'
                    },
                    {
                        'name': 'Jon Gambrell',
                        'title': 'Gulf and Iran Correspondent',
                        'beat': 'Middle East affairs',
                        'twitter': '@jongambrellAP'
                    },
                    {
                        'name': 'Isabel DeBre',
                        'title': 'Middle East Correspondent',
                        'beat': 'Humanitarian issues',
                        'twitter': '@isabeldebre'
                    },
                    {
                        'name': 'Julia Frankel',
                        'title': 'Jerusalem Correspondent',
                        'beat': 'Israel-Palestine conflict',
                        'twitter': '@juliafrankel'
                    }
                ]
            },
            {
                'name': 'BBC News',
                'country': 'UK',
                'bias': 'neutral',
                'website': 'https://www.bbc.com/news',
                'reporters': [
                    {
                        'name': 'Barbara Plett Usher',
                        'title': 'State Department Correspondent',
                        'beat': 'US foreign policy',
                        'twitter': '@BBCBarbaraPlett'
                    },
                    {
                        'name': 'Paul Adams',
                        'title': 'Diplomatic Correspondent',
                        'beat': 'International affairs',
                        'twitter': '@BBCPaulAdams'
                    },
                    {
                        'name': 'Anna Foster',
                        'title': 'Middle East Correspondent',
                        'beat': 'Regional conflicts',
                        'twitter': '@annafostertv'
                    },
                    {
                        'name': 'Jeremy Bowen',
                        'title': 'Middle East Editor',
                        'beat': 'Conflict analysis',
                        'twitter': '@BowenBBC'
                    },
                    {
                        'name': 'Lyse Doucet',
                        'title': 'Chief International Correspondent',
                        'beat': 'Global affairs',
                        'twitter': '@bbclysedoucet'
                    }
                ]
            }
        ]
    },
    
    'key_issues': [
        'nuclear program', 'regional influence', 'proxy wars', 'sanctions', 'military strikes',
        'ceasefire negotiations', 'hostage deals', 'humanitarian aid', 'international diplomacy',
        'media bias', 'rhetoric escalation', 'economic impact', 'refugee crisis'
    ],
    
    'analysis_parameters': {
        'sentiment_thresholds': {
            'strongly_pro': 0.8,
            'moderately_pro': 0.6,
            'neutral': 0.4,
            'moderately_against': 0.2,
            'strongly_against': 0.0
        },
        'trend_analysis_window': '30d',  # 30 days for trend detection
        'contradiction_threshold': 0.7,  # 70% inconsistency considered contradiction
        'min_statements_for_analysis': 5  # Minimum statements required for meaningful analysis
    }
}

# Keyword mappings for analysis
KEYWORDS_BY_SIDE = {
    'pro-israel': [
        'security', 'defense', 'terrorism', 'nuclear threat', 'deterrence',
        'right to exist', 'self-defense', 'hostages', 'ceasefire', 'two-state solution',
        'military aid', 'defense cooperation', 'security guarantees', 'allies', 'partners'
    ],
    
    'pro-iran': [
        'resistance', 'oppression', 'occupation', 'imperialism', 'Zionist regime',
        'liberation', 'justice', 'sanctions', 'economic warfare', 'sovereignty',
        'nuclear rights', 'regional influence', 'axis of resistance', 'proxy forces'
    ],
    
    'neutral': [
        'ceasefire', 'humanitarian aid', 'diplomacy', 'negotiations', 'peace process',
        'international law', 'United Nations', 'war crimes', 'civilian casualties', 'refugees'
    ]
}