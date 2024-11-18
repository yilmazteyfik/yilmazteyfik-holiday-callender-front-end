'use client';
//debugger;

import { useState, useEffect } from 'react';
import { apiClient } from './utils/apiClient';

type Country = {
    countryName: string;
    countryId: number;
};

type Region = {
    regionName: string;
    regionId: number;
    countryId: number;
};

type Holiday = {
    holidayId: number;
    holidayName: string;
    holidayDate: string;
    regionId: number;
    holidayType: string;
    holidayColor?: string; // holidayColor özelliği opsiyonel olarak eklendi
};

type Filter = {
    country: string;
    region: string;
    type: string;
};

const FullPageCalendar = () => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [filteredHolidays, setFilteredHolidays] = useState<Holiday[]>([]); // Filtrelenmiş tatiller için yeni bir state
    const [filters, setFilters] = useState<Filter>({
        country: 'Germany', // Varsayılan olarak Almanya
        region: '',
        type: '',
    });
    const [view, setView] = useState<'monthly' | 'yearly'>('monthly');

    const today = new Date();
    const currentYear = today.getFullYear();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());

    // Ülkeleri çeken fonksiyon
    const fetchCountries = async () => {
        try {
            const data = await apiClient('/api/holiday/getCountries');
            setCountries(data);
        } catch (error) {
            console.error('Error fetching countries:', error);
        }
    };

    // Seçilen ülkenin eyaletlerini çeken fonksiyon
    const fetchRegions = async (countryId: number) => {
        try {
            const data = await apiClient(`/api/holiday/getRegions/${countryId}`);
            setRegions(data);
        } catch (error) {
            console.error('Error fetching regions:', error);
        }
    };

    // Seçilen eyaletin tatillerini çeken fonksiyon
    const fetchHolidays = async (regionId: number) => {
        try {
            const data = await apiClient(`/api/holiday/getHolidays/${regionId}`);
            const categorizedHolidays = categorizeHolidays(data);
            setHolidays(categorizedHolidays);
        } catch (error) {
            console.error('Error fetching holidays:', error);
        }
    };

    const categorizeHolidays = (data: any) => {
        const allHolidays: Holiday[] = [];
        const holidayColors: { [key: string]: string } = {
            public: '#F44336', // Kırmızı, resmi tatiller
            religious: '#4CAF50', // Yeşil, dini tatiller
            special: '#FFEB3B', // Sarı, özel günler
        };

        // Public Holidays
        data.publicHolidays.forEach((holiday: any) => {
            allHolidays.push({
                ...holiday,
                holidayType: 'public',
                holidayColor: holidayColors.public,
            });
        });

        // Religious Holidays
        data.religiousHolidays.forEach((holiday: any) => {
            allHolidays.push({
                ...holiday,
                holidayType: 'religious',
                holidayColor: holidayColors.religious,
            });
        });

        // Special Holidays
        data.specialHolidays.forEach((holiday: any) => {
            allHolidays.push({
                ...holiday,
                holidayType: 'special',
                holidayColor: holidayColors.special,
            });
        });

        return allHolidays;
    };

    // Ülkeleri ilk yüklediğimizde çağırıyoruz
    useEffect(() => {
        fetchCountries(); // Ülkeleri çeker
    }, []);

    // Ülke değiştiğinde, o ülkenin eyaletlerini çek
    useEffect(() => {
        const selectedCountry = countries.find((country) => country.countryName === filters.country);
        if (selectedCountry) {
            fetchRegions(selectedCountry.countryId);
        }
    }, [filters.country, countries]);

    // Eyalet değiştiğinde, tatilleri çek
    useEffect(() => {
        if (filters.region) {
            const selectedRegion = regions.find((region) => region.regionName === filters.region);
            if (selectedRegion) {
                fetchHolidays(selectedRegion.regionId);
            }
        }
    }, [filters.region, regions]);

    // Tür seçildiğinde tatil türlerini filtrele
    useEffect(() => {
        if (filters.type) {
            const filtered = holidays.filter(
                (holiday) => holiday.holidayType === filters.type
            );
            setFilteredHolidays(filtered);
        } else {
            setFilteredHolidays(holidays); // Tür seçili değilse tüm tatiller gösterilsin
        }
    }, [filters.type, holidays]);

    const handleFilterChange = (key: keyof Filter, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleMonthChange = (direction: 'prev' | 'next') => {
        setCurrentMonth((prev) => {
            const newMonth = direction === 'prev' ? prev - 1 : prev + 1;
            return (newMonth + 12) % 12;
        });
    };

    const renderYearlyView = () => {
        const months = Array.from({ length: 12 }, (_, i) => i);
        const rows = [];
        for (let i = 0; i < 12; i += 3) {
            rows.push(months.slice(i, i + 3));
        }
    
        return rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-4 mb-6">
                {row.map((month) => (
                    <div key={month} className="w-1/3 p-4 border rounded-md bg-white shadow-lg">
                        <h3 className="text-center font-bold text-lg mb-2">
                            {new Date(currentYear, month).toLocaleString('tr-TR', { month: 'long' })}
                        </h3>
                        <div className="calendar grid grid-cols-7 gap-2">
                            {renderSmallMonthWithHolidays(month)}
                        </div>
                    </div>
                ))}
            </div>
        ));
    };
    
    const renderSmallMonthWithHolidays = (month: number) => {
        const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentYear, month, 1).getDay();
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
        return (
            <>
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`blank-${i}`} className="day blank"></div>
                ))}
                {days.map((day) => {
                    const holiday = filteredHolidays.find(
                        (h) =>
                            new Date(h.holidayDate).getDate() === day &&
                            new Date(h.holidayDate).getMonth() === month
                    );
                    return (
                        <div
                            key={day}
                            className={`day flex flex-col justify-center items-center p-3 border rounded-md ${
                                holiday
                                    ? '' // Dinamik renk için boş bırakıyoruz, çünkü rengi style ile vereceğiz
                                    : 'bg-white hover:bg-gray-100 transition-all'
                            }`}
                            style={{
                                backgroundColor: holiday ? holiday.holidayColor : 'white', // Dinamik olarak holidayColor'ı ekliyoruz
                            }}
                        >
                            <span className="text-sm">{day}</span>
                            {holiday && <p className="text-xs text-center">{holiday.holidayName}</p>}
                        </div>
                    );
                })}
            </>
        );
    };




    const renderMonthlyView = () => {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
        return (
            <div className="calendar grid grid-cols-7 gap-4">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`blank-${i}`} className="day blank"></div>
                ))}
                {days.map((day) => {
                    const holiday = filteredHolidays.find(
                        (h) => new Date(h.holidayDate).getDate() === day && new Date(h.holidayDate).getMonth() === currentMonth
                    );
                    return (
                        <div
                            key={day}
                            className={`day flex flex-col justify-center items-center p-4 border rounded-md ${
                                holiday
                                    ? '' // Dinamik renk için boş bırakıyoruz, çünkü rengi style ile vereceğiz
                                    : 'bg-white hover:bg-gray-100 transition-all'
                            }`}
                            style={{
                                backgroundColor: holiday ? holiday.holidayColor : 'white', // Dinamik olarak holidayColor'ı ekliyoruz
                            }}
                        >
                            <span className="text-lg">{day}</span>
                            {holiday && <p className="text-sm text-gray-600">{holiday.holidayName}</p>}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="calendar-container flex flex-col h-screen p-6 bg-[#FBF9F4]">
            <div className="header flex flex-col gap-4 mb-6">
                <div className="filters flex gap-4">
                    <select
                        value={filters.country}
                        onChange={(e) => handleFilterChange('country', e.target.value)}
                        className="p-2 text-sm border rounded-md bg-white shadow-md"
                    >
                        {countries.map((country) => (
                            <option key={country.countryId} value={country.countryName}>
                                {country.countryName}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filters.region}
                        onChange={(e) => handleFilterChange('region', e.target.value)}
                        className="p-2 text-sm border rounded-md bg-white shadow-md"
                    >
                        <option value="">Tümü</option>
                        {regions.map((region) => (
                            <option key={region.regionId} value={region.regionName}>
                                {region.regionName}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="p-2 text-sm border rounded-md bg-white shadow-md"
                    >
                        <option value="">Tümü</option>
                        <option value="public">Resmi Tatil</option>
                        <option value="religious">Dini Tatil</option>
                        <option value="special">Özel Gün</option>
                    </select>
                </div>
                <div className="month-navigation flex justify-between items-center mb-4">
                    <button
                        onClick={() => handleMonthChange('prev')}
                        className="p-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-all"
                    >
                        Önceki
                    </button>
                    <h2 className="text-xl font-bold text-center">
                        {view === 'monthly' ? (
                            new Date(currentYear, currentMonth).toLocaleString('tr-TR', { month: 'long', year: 'numeric' })
                        ) : (
                            `${currentYear}`
                        )}
                    </h2>
                    <button
                        onClick={() => handleMonthChange('next')}
                        className="p-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-all"
                    >
                        Sonraki
                    </button>
                </div>
                <div className="view-toggle flex justify-center gap-4">
                    <button
                        onClick={() => setView('monthly')}
                        className={`p-2 rounded-md ${view === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Aylık
                    </button>
                    <button
                        onClick={() => setView('yearly')}
                        className={`p-2 rounded-md ${view === 'yearly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Yıllık
                    </button>
                </div>
            </div>
            <div className="calendar-content">
                {view === 'monthly' ? renderMonthlyView() : renderYearlyView()}
            </div>
        </div>
    );
};

export default FullPageCalendar;