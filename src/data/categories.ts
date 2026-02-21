// Define the hierarchy structure
// Using local object for now, can be moved to a config file/db later
export const CATEGORY_DATA: Record<string, any> = {
    'Emlak': {
        subcategories: {
            'Konut': {
                types: {
                    'Satılık': ['Daire', 'Rezidans', 'Müstakil Ev', 'Villa', 'Çiftlik Evi', 'Köşk & Konak', 'Yalı', 'Yalı Dairesi', 'Yazlık', 'Kooperatif'],
                    'Kiralık': ['Daire', 'Rezidans', 'Müstakil Ev', 'Villa', 'Çiftlik Evi', 'Köşk & Konak', 'Yalı', 'Yalı Dairesi', 'Yazlık'],
                    'Turistik Günlük Kiralık': ['Daire', 'Rezidans', 'Müstakil Ev', 'Villa'],
                    'Devren Satılık Konut': ['Daire']
                }
            },
            'İş Yeri': {
                types: {
                    'Satılık': ['Dükkan & Mağaza', 'Ofis', 'Plaza Katı'],
                    'Kiralık': ['Dükkan & Mağaza', 'Ofis', 'Plaza Katı'],
                    'Devren Satılık': ['Dükkan & Mağaza', 'Restoran']
                }
            },
            'Arsa': {
                types: {
                    'Satılık': ['İmarlı - Konut', 'İmarlı - Ticari', 'Bağ & Bahçe', 'Zeytinlik', 'Tarla'],
                    'Kiralık': ['Bağ & Bahçe', 'Tarla']
                }
            },
            'Bina': {
                types: {
                    'Satılık': ['Apartman', 'Plaza', 'İş Hanı', 'Müstakil', 'Villa', 'Köşk', 'Yurt', 'Fabrika'],
                    'Kiralık': ['Apartman', 'Plaza', 'İş Hanı', 'Müstakil']
                }
            },
            'Devre Mülk': {
                types: {
                    'Satılık': ['Daire', 'Villa', 'Müstakil', 'Termal'],
                    'Kiralık': ['Daire', 'Villa', 'Müstakil', 'Termal']
                }
            },
            'Turistik Tesis': {
                types: {
                    'Satılık': ['Otel', 'Butik Otel', 'Pansiyon', 'Tatil Köyü', 'Apart Otel', 'Kamping'],
                    'Kiralık': ['Otel', 'Butik Otel', 'Pansiyon']
                }
            }
        }
    },
    'Vasıta': {
        subcategories: {
            'Otomobil': {
                types: {
                    'Satılık': ['Alfa Romeo', 'Audi', 'BMW', 'Chery', 'Chevrolet', 'Citroen', 'Dacia', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Jaguar', 'Jeep', 'Kia', 'Land Rover', 'Lexus', 'Mazda', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 'Opel', 'Peugeot', 'Porsche', 'Renault', 'Seat', 'Skoda', 'Subaru', 'Suzuki', 'Tesla', 'Togg', 'Toyota', 'Volkswagen', 'Volvo'],
                    'Kiralık': ['Audi', 'BMW', 'Fiat', 'Ford', 'Mercedes-Benz', 'Renault', 'Toyota', 'Volkswagen']
                }
            },
            'Arazi, SUV & Pickup': {
                types: {
                    'Satılık': ['Dacia', 'Daihatsu', 'Dodge', 'Ford', 'Honda', 'Hyundai', 'Isuzu', 'Jeep', 'Kia', 'Lada', 'Land Rover', 'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'Porsche', 'Range Rover', 'SsangYong', 'Subaru', 'Suzuki', 'Toyota', 'Volkswagen'],
                    'Kiralık': ['Dacia', 'Jeep', 'Land Rover', 'Nissan']
                }
            },
            'Motosiklet': {
                types: {
                    'Satılık': ['Aprilia', 'Bajaj', 'BMW', 'Ducati', 'Harley Davidson', 'Honda', 'Husqvarna', 'Kawasaki', 'KTM', 'Kymco', 'Mondial', 'Piaggio', 'Suzuki', 'Triumph', 'Vespa', 'Yamaha'],
                    'Kiralık': ['Honda', 'Yamaha', 'Vespa']
                }
            },
            'Minivan & Panelvan': {
                types: {
                    'Satılık': ['Ford', 'Fiat', 'Renault', 'Volkswagen', 'Peugeot', 'Citroen', 'Mercedes-Benz'],
                    'Kiralık': ['Ford', 'Fiat', 'Renault']
                }
            },
            'Ticari Araçlar': {
                types: {
                    'Satılık': ['Kamyon', 'Kamyonet', 'Tır', 'Otobüs', 'Minibüs', 'Midibüs'],
                    'Kiralık': ['Kamyon', 'Kamyonet', 'Otobüs']
                }
            },
            'Kiralık Araçlar': {
                types: {
                    'Günlük': ['Binek', 'Ticari', 'VIP', 'SUV', 'Spor'],
                    'Aylık': ['Binek', 'Ticari', 'VIP', 'Filo']
                }
            },
            'Hasarlı Araçlar': {
                types: {
                    'Satılık': ['Otomobil', 'Motosiklet', 'Ticari', 'SUV']
                }
            },
            'Karavan': {
                types: {
                    'Satılık': ['Motokaravan', 'Çekme Karavan', 'Camper'],
                    'Kiralık': ['Motokaravan', 'Çekme Karavan']
                }
            },
            'Klasik Araçlar': {
                types: {
                    'Satılık': ['Otomobil', 'Motosiklet', 'Kamyonet']
                }
            },
            'Elektrikli Araçlar': {
                types: {
                    'Satılık': ['Otomobil', 'Motosiklet', 'Scooter', 'Bisiklet'],
                    'Kiralık': ['Otomobil', 'Scooter']
                }
            },

        }
    },
    'Yedek Parça': {
        subcategories: {
            'Otomotiv Ekipmanları': {
                types: {
                    'Satılık': ['Aksesuar', 'Yedek Parça', 'Ses Sistemi', 'Görüntü Sistemi', 'Jant & Lastik']
                }
            },
            'Motosiklet Ekipmanları': {
                types: {
                    'Satılık': ['Kask', 'Kıyafet', 'Aksesuar', 'Yedek Parça', 'Egzoz']
                }
            },

        }
    }
};
