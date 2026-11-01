"""
APEX TELEMETRY 3D — Official Formula 1 24-Circuit Registry & Spline Generator (Python Core)
Source of Truth: Sportmonks F1 API & Formula-Timer Circuit Database
"""

import math
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple

@dataclass
class TurnInfo:
    number: int
    name: str
    apex_speed_kph: float
    gear: int
    distance_meters: float = 0.0

@dataclass
class DrsZone:
    number: int
    name: str
    start_distance: float
    end_distance: float

@dataclass
class TrackWaypoint:
    x: float
    y: float
    z: float
    distance_meters: float
    curvature: float
    heading: float
    speed_limit_kph: float
    recommended_gear: int

@dataclass
class CircuitDefinition:
    circuit_id: str
    official_name: str
    country: str
    location: str
    length_meters: float
    turn_count: int
    drs_zone_count: int
    lap_record_time: str
    lap_record_driver: str
    lap_record_year: int
    recent_fastest_lap: Optional[str] = None
    recent_driver: Optional[str] = None
    recent_year: Optional[int] = None
    turns: List[TurnInfo] = field(default_factory=list)
    drs_zones: List[DrsZone] = field(default_factory=list)
    anchors: List[Tuple[float, float, float]] = field(default_factory=list)

# Official 24 Grand Prix Calendar Registry
CIRCUITS: Dict[str, CircuitDefinition] = {
    "bahrain": CircuitDefinition(
        circuit_id="bahrain",
        official_name="Bahrain International Circuit",
        country="Bahrain",
        location="Sakhir",
        length_meters=5412.0,
        turn_count=15,
        drs_zone_count=3,
        lap_record_time="1:31.447",
        lap_record_driver="Pedro de la Rosa",
        lap_record_year=2005,
        recent_fastest_lap="1:32.608",
        recent_driver="Charles Leclerc",
        recent_year=2024,
        turns=[
            TurnInfo(1, "Michael Schumacher Hairpin", 68.0, 2, 620.0),
            TurnInfo(4, "Turn 4 Right", 135.0, 3, 1420.0),
            TurnInfo(8, "Hairpin 8", 72.0, 2, 2540.0),
            TurnInfo(10, "Downhill Off-camber T10", 78.0, 2, 3180.0),
            TurnInfo(14, "Final Corner", 140.0, 4, 5120.0),
        ],
        drs_zones=[
            DrsZone(1, "Main Straight", 170.0, 900.0),
            DrsZone(2, "Turns 3-4 Straight", 1100.0, 1650.0),
            DrsZone(3, "Back Straight", 3300.0, 3950.0),
        ],
        anchors=[(0, 0, -350), (40, 0, 250), (180, 1, 320), (260, 3, 120), (120, 2, -100), (-50, -2, 80), (-160, 0, -220)],
    ),
    "jeddah": CircuitDefinition(
        circuit_id="jeddah",
        official_name="Jeddah Corniche Circuit",
        country="Saudi Arabia",
        location="Jeddah",
        length_meters=6174.0,
        turn_count=27,
        drs_zone_count=3,
        lap_record_time="1:30.734",
        lap_record_driver="Lewis Hamilton",
        lap_record_year=2021,
        recent_fastest_lap="1:31.632",
        recent_driver="Charles Leclerc",
        recent_year=2024,
        turns=[
            TurnInfo(1, "Turn 1 Chicane Left", 110.0, 3, 550.0),
            TurnInfo(13, "Turn 13 Banked Hairpin", 145.0, 4, 2650.0),
            TurnInfo(22, "Turn 22 Chicane", 215.0, 5, 4450.0),
            TurnInfo(27, "Turn 27 Final Hairpin", 105.0, 3, 5950.0),
        ],
        drs_zones=[
            DrsZone(1, "Main Pit Straight", 200.0, 950.0),
            DrsZone(2, "Back Corniche Run 1", 3100.0, 4100.0),
            DrsZone(3, "Back Corniche Run 2", 4800.0, 5800.0),
        ],
        anchors=[(0, 0, -400), (30, 0, 280), (70, 1, 620), (-40, 0, 400), (-60, 0, -250)],
    ),
    "melbourne": CircuitDefinition(
        circuit_id="melbourne",
        official_name="Albert Park Circuit",
        country="Australia",
        location="Melbourne",
        length_meters=5278.0,
        turn_count=14,
        drs_zone_count=4,
        lap_record_time="1:19.813",
        lap_record_driver="Charles Leclerc",
        lap_record_year=2024,
        recent_fastest_lap="1:19.813",
        recent_driver="Charles Leclerc",
        recent_year=2024,
        turns=[
            TurnInfo(1, "Jones", 145.0, 3, 460.0),
            TurnInfo(3, "Sports Center", 100.0, 2, 1150.0),
            TurnInfo(9, "Lakeside Sweep", 245.0, 6, 3100.0),
            TurnInfo(13, "Ascari", 130.0, 3, 4600.0),
        ],
        drs_zones=[
            DrsZone(1, "Main Pit Straight", 150.0, 750.0),
            DrsZone(2, "Turns 2-3 Straight", 950.0, 1450.0),
            DrsZone(3, "Lakeside High-Speed Run", 2700.0, 3500.0),
            DrsZone(4, "Turn 10-11 Straight", 3800.0, 4500.0),
        ],
        anchors=[(0, 0, -350), (80, 0, 180), (190, 1, 290), (150, 0, 520), (-80, 0, 120), (-40, 0, -200)],
    ),
    "suzuka": CircuitDefinition(
        circuit_id="suzuka",
        official_name="Suzuka International Racing Course",
        country="Japan",
        location="Suzuka, Mie Prefecture",
        length_meters=5807.0,
        turn_count=18,
        drs_zone_count=1,
        lap_record_time="1:30.983",
        lap_record_driver="Lewis Hamilton",
        lap_record_year=2019,
        recent_fastest_lap="1:33.706",
        recent_driver="Max Verstappen",
        recent_year=2024,
        turns=[
            TurnInfo(1, "First Curve", 220.0, 5, 520.0),
            TurnInfo(3, "S-Curves 1", 205.0, 5, 1050.0),
            TurnInfo(8, "Degner 1", 235.0, 6, 2080.0),
            TurnInfo(11, "Hairpin", 72.0, 2, 2750.0),
            TurnInfo(15, "130R", 295.0, 8, 4850.0),
            TurnInfo(16, "Casio Triangle Chicane", 75.0, 2, 5250.0),
        ],
        drs_zones=[DrsZone(1, "Main Pit Straight", 180.0, 820.0)],
        anchors=[(0, 0, -350), (80, 2, 120), (140, 8, 280), (60, 5, 420), (-110, 0, 340), (-160, 12, 80), (-80, 4, -180)],
    ),
    "shanghai": CircuitDefinition(
        circuit_id="shanghai",
        official_name="Shanghai International Circuit",
        country="China",
        location="Jiading, Shanghai",
        length_meters=5451.0,
        turn_count=16,
        drs_zone_count=2,
        lap_record_time="1:32.238",
        lap_record_driver="Michael Schumacher",
        lap_record_year=2004,
        recent_fastest_lap="1:37.810",
        recent_driver="Fernando Alonso",
        recent_year=2024,
        turns=[
            TurnInfo(1, "Turn 1 Snail Entry", 230.0, 5, 500.0),
            TurnInfo(3, "Turn 3 Snail Apex", 85.0, 2, 850.0),
            TurnInfo(13, "Turn 13 Banked", 195.0, 5, 3600.0),
            TurnInfo(14, "Turn 14 Hairpin", 68.0, 2, 4850.0),
        ],
        drs_zones=[
            DrsZone(1, "Main Straight", 150.0, 800.0),
            DrsZone(2, "Long Back Straight (1.2km)", 3750.0, 4800.0),
        ],
        anchors=[(0, 0, -350), (90, 0, 220), (130, 0, 120), (40, 0, 450), (-150, 0, 100), (-60, 0, -200)],
    ),
    "miami": CircuitDefinition(
        circuit_id="miami",
        official_name="Miami International Autodrome",
        country="United States",
        location="Miami Gardens, Florida",
        length_meters=5412.0,
        turn_count=19,
        drs_zone_count=3,
        lap_record_time="1:29.708",
        lap_record_driver="Max Verstappen",
        lap_record_year=2023,
        recent_fastest_lap="1:30.634",
        recent_driver="Oscar Piastri",
        recent_year=2024,
        turns=[
            TurnInfo(1, "Turn 1", 110.0, 3, 450.0),
            TurnInfo(7, "Turn 7 Marina Hook", 90.0, 2, 1750.0),
            TurnInfo(14, "Turn 14 Chicane Crest", 72.0, 2, 3600.0),
            TurnInfo(17, "Turn 17 Hairpin", 70.0, 2, 4850.0),
        ],
        drs_zones=[
            DrsZone(1, "Pit Straight", 120.0, 680.0),
            DrsZone(2, "Turns 8-11 Straight", 2100.0, 2850.0),
            DrsZone(3, "Back Straight (1.3km)", 3850.0, 4800.0),
        ],
        anchors=[(0, 0, -350), (75, 0, 200), (180, 0, 350), (40, 4, 480), (-140, 0, 80), (-45, 0, -200)],
    ),
    "imola": CircuitDefinition(
        circuit_id="imola",
        official_name="Autodromo Enzo e Dino Ferrari",
        country="Italy",
        location="Imola, Emilia-Romagna",
        length_meters=4909.0,
        turn_count=19,
        drs_zone_count=1,
        lap_record_time="1:15.484",
        lap_record_driver="Lewis Hamilton",
        lap_record_year=2020,
        recent_fastest_lap="1:18.589",
        recent_driver="George Russell",
        recent_year=2024,
        turns=[
            TurnInfo(2, "Tamburello", 135.0, 3, 750.0),
            TurnInfo(7, "Tosa Hairpin", 85.0, 2, 1850.0),
            TurnInfo(9, "Piratella", 195.0, 5, 2350.0),
            TurnInfo(11, "Acque Minerali", 145.0, 3, 2850.0),
            TurnInfo(14, "Variante Alta", 125.0, 3, 3600.0),
            TurnInfo(17, "Rivazza", 120.0, 3, 4300.0),
        ],
        drs_zones=[DrsZone(1, "Pit Straight", 120.0, 950.0)],
        anchors=[(0, 0, -300), (60, 0, 200), (120, 4, 320), (40, 12, 440), (-50, 5, 360), (-110, 8, 180), (-80, 0, -150)],
    ),
    "monaco": CircuitDefinition(
        circuit_id="monaco",
        official_name="Circuit de Monaco",
        country="Monaco",
        location="Monte Carlo",
        length_meters=3337.0,
        turn_count=19,
        drs_zone_count=1,
        lap_record_time="1:12.909",
        lap_record_driver="Lewis Hamilton",
        lap_record_year=2021,
        recent_fastest_lap="1:14.165",
        recent_driver="Lewis Hamilton",
        recent_year=2024,
        turns=[
            TurnInfo(1, "Sainte Dévote", 90.0, 2, 320.0),
            TurnInfo(4, "Casino Square", 135.0, 3, 900.0),
            TurnInfo(6, "Fairmont Hairpin", 48.0, 1, 1350.0),
            TurnInfo(10, "Nouvelle Chicane", 72.0, 2, 2050.0),
            TurnInfo(15, "Swimming Pool", 195.0, 5, 2650.0),
            TurnInfo(18, "La Rascasse", 55.0, 1, 3100.0),
        ],
        drs_zones=[DrsZone(1, "Pit Straight", 50.0, 450.0)],
        anchors=[(0, 0, -250), (45, 2, 80), (110, 14, 180), (75, 8, 240), (-30, 0, 280), (-80, 0, 120), (-40, 0, -120)],
    ),
    "montreal": CircuitDefinition(
        circuit_id="montreal",
        official_name="Circuit Gilles Villeneuve",
        country="Canada",
        location="Montreal, Quebec",
        length_meters=4361.0,
        turn_count=14,
        drs_zone_count=2,
        lap_record_time="1:13.078",
        lap_record_driver="Valtteri Bottas",
        lap_record_year=2019,
        recent_fastest_lap="1:14.856",
        recent_driver="Lewis Hamilton",
        recent_year=2024,
        turns=[
            TurnInfo(1, "Virage Senna", 115.0, 3, 450.0),
            TurnInfo(8, "Pont de la Concorde", 125.0, 3, 2150.0),
            TurnInfo(10, "L'Epingle Hairpin", 65.0, 2, 2850.0),
            TurnInfo(13, "Wall of Champions", 130.0, 3, 4150.0),
        ],
        drs_zones=[
            DrsZone(1, "Casino Straight", 2950.0, 4100.0),
            DrsZone(2, "Main Pit Straight", 120.0, 650.0),
        ],
        anchors=[(0, 0, -300), (40, 0, 120), (70, 0, 380), (20, 0, 520), (-50, 0, 150), (-25, 0, -180)],
    ),
    "barcelona": CircuitDefinition(
        circuit_id="barcelona",
        official_name="Circuit de Barcelona-Catalunya",
        country="Spain",
        location="Montmeló, Catalonia",
        length_meters=4657.0,
        turn_count=14,
        drs_zone_count=2,
        lap_record_time="1:16.330",
        lap_record_driver="Max Verstappen",
        lap_record_year=2023,
        recent_fastest_lap="1:17.115",
        recent_driver="Lando Norris",
        recent_year=2024,
        turns=[
            TurnInfo(1, "Elf", 135.0, 3, 750.0),
            TurnInfo(3, "Renault Sweeper", 235.0, 6, 1350.0),
            TurnInfo(10, "La Caixa Hairpin", 90.0, 2, 3100.0),
            TurnInfo(13, "Europcar High-Speed", 240.0, 6, 4200.0),
            TurnInfo(14, "New Final Sweep", 255.0, 7, 4450.0),
        ],
        drs_zones=[
            DrsZone(1, "Main Pit Straight (1.05km)", 180.0, 950.0),
            DrsZone(2, "Back Straight", 2500.0, 3050.0),
        ],
        anchors=[(0, 0, -320), (75, 0, 220), (160, 4, 380), (50, 6, 460), (-90, 2, 180), (-50, 0, -150)],
    ),
    "spielberg": CircuitDefinition(
        circuit_id="spielberg",
        official_name="Red Bull Ring",
        country="Austria",
        location="Spielberg, Styria",
        length_meters=4318.0,
        turn_count=10,
        drs_zone_count=3,
        lap_record_time="1:05.619",
        lap_record_driver="Carlos Sainz",
        lap_record_year=2020,
        recent_fastest_lap="1:07.694",
        recent_driver="Fernando Alonso",
        recent_year=2024,
        turns=[
            TurnInfo(1, "Niki Lauda Kurve", 140.0, 3, 420.0),
            TurnInfo(3, "Remus Hairpin", 70.0, 2, 1400.0),
            TurnInfo(4, "Schlossgold", 135.0, 3, 2100.0),
            TurnInfo(9, "Jochen Rindt", 220.0, 6, 3850.0),
            TurnInfo(10, "Final Corner", 195.0, 5, 4150.0),
        ],
        drs_zones=[
            DrsZone(1, "Pit Straight", 120.0, 650.0),
            DrsZone(2, "Uphill Straight (Turns 1-3)", 750.0, 1550.0),
            DrsZone(3, "Downhill Straight (Turns 3-4)", 1750.0, 2350.0),
        ],
        anchors=[(0, 0, -280), (60, 6, 120), (110, 22, 360), (-40, 10, 310), (-90, 2, 60), (-40, 0, -140)],
    ),
    "silverstone": CircuitDefinition(
        circuit_id="silverstone",
        official_name="Silverstone Circuit",
        country="United Kingdom",
        location="Silverstone, Northamptonshire",
        length_meters=5891.0,
        turn_count=18,
        drs_zone_count=2,
        lap_record_time="1:27.097",
        lap_record_driver="Max Verstappen",
        lap_record_year=2020,
        recent_fastest_lap="1:28.293",
        recent_driver="Carlos Sainz",
        recent_year=2024,
        turns=[
            TurnInfo(1, "Abbey", 285.0, 7, 420.0),
            TurnInfo(3, "Village Arena", 95.0, 2, 1050.0),
            TurnInfo(6, "Brooklands", 165.0, 4, 2150.0),
            TurnInfo(9, "Copse", 290.0, 8, 3100.0),
            TurnInfo(10, "Maggotts", 305.0, 8, 3500.0),
            TurnInfo(11, "Becketts", 250.0, 6, 3750.0),
            TurnInfo(15, "Stowe", 215.0, 5, 4950.0),
            TurnInfo(16, "Vale", 110.0, 3, 5450.0),
        ],
        drs_zones=[
            DrsZone(1, "Wellington Straight", 1350.0, 2100.0),
            DrsZone(2, "Hangar Straight", 4100.0, 4950.0),
        ],
        anchors=[(0, 0, -350), (80, 0, 120), (160, 0, 260), (110, 0, 420), (-60, 0, 380), (-140, 0, 220), (-180, 0, -50), (-70, 0, -250)],
    ),
    "hungaroring": CircuitDefinition(
        circuit_id="hungaroring",
        official_name="Hungaroring",
        country="Hungary",
        location="Mogyoród, Pest County",
        length_meters=4381.0,
        turn_count=14,
        drs_zone_count=2,
        lap_record_time="1:16.627",
        lap_record_driver="Lewis Hamilton",
        lap_record_year=2020,
        recent_fastest_lap="1:20.305",
        recent_driver="George Russell",
        recent_year=2024,
        turns=[
            TurnInfo(1, "Turn 1 Downhill Hairpin", 95.0, 2, 750.0),
            TurnInfo(2, "Turn 2 Off-Camber Left", 130.0, 3, 1150.0),
            TurnInfo(4, "Turn 4 Fast Blind Left", 220.0, 5, 1750.0),
            TurnInfo(11, "Turn 11 Fast Right", 235.0, 6, 3450.0),
            TurnInfo(14, "Final Long Carousel", 135.0, 3, 4150.0),
        ],
        drs_zones=[
            DrsZone(1, "Main Pit Straight", 120.0, 850.0),
            DrsZone(2, "Downhill Straight", 950.0, 1350.0),
        ],
        anchors=[(0, 0, -280), (60, -4, 160), (120, 2, 280), (80, 8, 420), (-50, 4, 320), (-80, 0, -120)],
    ),
    "spa": CircuitDefinition(
        circuit_id="spa",
        official_name="Circuit de Spa-Francorchamps",
        country="Belgium",
        location="Stavelot, Ardennes",
        length_meters=7004.0,
        turn_count=19,
        drs_zone_count=2,
        lap_record_time="1:46.286",
        lap_record_driver="Valtteri Bottas",
        lap_record_year=2018,
        recent_fastest_lap="1:44.701",
        recent_driver="Sergio Perez",
        recent_year=2024,
        turns=[
            TurnInfo(1, "La Source Hairpin", 72.0, 2, 380.0),
            TurnInfo(2, "Eau Rouge", 305.0, 8, 920.0),
            TurnInfo(4, "Raidillon Crest", 310.0, 8, 1180.0),
            TurnInfo(5, "Les Combes Chicane", 145.0, 3, 2950.0),
            TurnInfo(8, "Bruxelles Hairpin", 115.0, 3, 3750.0),
            TurnInfo(10, "Pouhon Double Apex", 285.0, 7, 4500.0),
            TurnInfo(14, "Stavelot", 215.0, 5, 5500.0),
            TurnInfo(17, "Blanchimont", 310.0, 8, 6250.0),
            TurnInfo(18, "Bus Stop Chicane", 78.0, 2, 6750.0),
        ],
        drs_zones=[
            DrsZone(1, "Kemmel Straight", 1350.0, 2850.0),
            DrsZone(2, "Pit Straight", 120.0, 500.0),
        ],
        anchors=[(0, 0, -450), (50, 0, 80), (120, 24, 320), (190, 38, 620), (90, 22, 780), (-110, 10, 580), (-160, 5, 220), (-120, 0, -200), (-40, 0, -380)],
    ),
    "zandvoort": CircuitDefinition(
        circuit_id="zandvoort",
        official_name="Circuit Zandvoort",
        country="Netherlands",
        location="Zandvoort, North Holland",
        length_meters=4259.0,
        turn_count=14,
        drs_zone_count=2,
        lap_record_time="1:11.097",
        lap_record_driver="Lewis Hamilton",
        lap_record_year=2021,
        recent_fastest_lap="1:13.817",
        recent_driver="Lando Norris",
        recent_year=2024,
        turns=[
            TurnInfo(1, "Tarzanbocht", 105.0, 2, 450.0),
            TurnInfo(3, "Hugenholtzbocht 19 deg Banked", 120.0, 3, 1050.0),
            TurnInfo(7, "Scheivlak Dunes Drop", 250.0, 6, 2100.0),
            TurnInfo(14, "Arie Luyendyk 18 deg Banked", 260.0, 7, 3950.0),
        ],
        drs_zones=[
            DrsZone(1, "Banked Final Corner to Main Straight", 3800.0, 450.0),
            DrsZone(2, "Turns 10-11 Straight", 2750.0, 3350.0),
        ],
        anchors=[(0, 0, -260), (60, 0, 120), (130, 4, 220), (70, 8, 410), (-60, 2, 290), (-80, 4, -100)],
    ),
    "monza": CircuitDefinition(
        circuit_id="monza",
        official_name="Autodromo Nazionale Monza",
        country="Italy",
        location="Monza, Lombardy",
        length_meters=5793.0,
        turn_count=11,
        drs_zone_count=2,
        lap_record_time="1:21.046",
        lap_record_driver="Rubens Barrichello",
        lap_record_year=2004,
        recent_fastest_lap="1:21.432",
        recent_driver="Lando Norris",
        recent_year=2024,
        turns=[
            TurnInfo(1, "Variante del Rettifilo", 75.0, 2, 1150.0),
            TurnInfo(3, "Curva Grande", 295.0, 8, 1850.0),
            TurnInfo(4, "Variante della Roggia", 115.0, 3, 2550.0),
            TurnInfo(6, "Lesmo 1", 185.0, 5, 3100.0),
            TurnInfo(7, "Lesmo 2", 165.0, 4, 3400.0),
            TurnInfo(8, "Variante Ascari", 215.0, 5, 4550.0),
            TurnInfo(11, "Curva Parabolica Alboreto", 210.0, 5, 5450.0),
        ],
        drs_zones=[
            DrsZone(1, "Main Rettifilo Straight (1.1km)", 120.0, 1050.0),
            DrsZone(2, "Serraglio Straight", 3550.0, 4400.0),
        ],
        anchors=[(0, 0, -420), (20, 0, 280), (110, 0, 480), (130, 0, 720), (40, 0, 850), (-30, 0, 820), (-90, 0, 420), (-60, 0, -250)],
    ),
    "baku": CircuitDefinition(
        circuit_id="baku",
        official_name="Baku City Circuit",
        country="Azerbaijan",
        location="Baku",
        length_meters=6003.0,
        turn_count=20,
        drs_zone_count=2,
        lap_record_time="1:43.009",
        lap_record_driver="Charles Leclerc",
        lap_record_year=2019,
        recent_fastest_lap="1:45.255",
        recent_driver="Lando Norris",
        recent_year=2024,
        turns=[
            TurnInfo(1, "Turn 1 90 deg Left", 115.0, 3, 750.0),
            TurnInfo(8, "Old City Castle Section", 85.0, 2, 2600.0),
            TurnInfo(16, "Turn 16 onto 2.2km Straight", 140.0, 3, 3950.0),
        ],
        drs_zones=[
            DrsZone(1, "Neftchilar Avenue (2.2km Straight)", 4100.0, 5950.0),
            DrsZone(2, "Turns 2-3 Straight", 1100.0, 1750.0),
        ],
        anchors=[(0, 0, -400), (30, 0, 220), (90, 0, 420), (50, 6, 620), (-50, 0, 350), (-20, 0, -250)],
    ),
    "singapore": CircuitDefinition(
        circuit_id="singapore",
        official_name="Marina Bay Street Circuit",
        country="Singapore",
        location="Marina Bay",
        length_meters=4940.0,
        turn_count=19,
        drs_zone_count=4,
        lap_record_time="1:34.486",
        lap_record_driver="Daniel Ricciardo",
        lap_record_year=2024,
        recent_fastest_lap="1:34.486",
        recent_driver="Daniel Ricciardo",
        recent_year=2024,
        turns=[
            TurnInfo(1, "Sheares", 120.0, 3, 420.0),
            TurnInfo(7, "Memorial Corner", 110.0, 3, 1750.0),
            TurnInfo(9, "Padang", 135.0, 3, 2350.0),
            TurnInfo(13, "Anderson Bridge Hairpin", 80.0, 2, 3100.0),
            TurnInfo(14, "Esplanade", 100.0, 2, 3600.0),
            TurnInfo(16, "New Raffles Avenue Link", 145.0, 4, 4100.0),
        ],
        drs_zones=[
            DrsZone(1, "Pit Straight", 100.0, 550.0),
            DrsZone(2, "Raffles Boulevard", 850.0, 1650.0),
            DrsZone(3, "Padang Straight", 2450.0, 3000.0),
            DrsZone(4, "New Bay Straight", 3700.0, 4350.0),
        ],
        anchors=[(0, 0, -320), (65, 0, 120), (140, 0, 280), (90, 0, 460), (-20, 0, 380), (-90, 0, 200), (-50, 0, -150)],
    ),
    "austin": CircuitDefinition(
        circuit_id="austin",
        official_name="Circuit of The Americas",
        country="United States",
        location="Austin, Texas",
        length_meters=5513.0,
        turn_count=20,
        drs_zone_count=2,
        lap_record_time="1:36.169",
        lap_record_driver="Charles Leclerc",
        lap_record_year=2019,
        recent_fastest_lap="1:37.330",
        recent_driver="Esteban Ocon",
        recent_year=2024,
        turns=[
            TurnInfo(1, "Big Red Hairpin", 85.0, 2, 480.0),
            TurnInfo(3, "Esses", 260.0, 7, 1050.0),
            TurnInfo(11, "Hairpin onto Back Straight", 75.0, 2, 2900.0),
            TurnInfo(12, "Heavy Braking", 88.0, 2, 4050.0),
            TurnInfo(16, "Stadium Triple Apex", 205.0, 5, 4800.0),
            TurnInfo(20, "Turn 20 onto Main Straight", 135.0, 3, 5450.0),
        ],
        drs_zones=[
            DrsZone(1, "Main Straight", 120.0, 600.0),
            DrsZone(2, "Back Straight", 3050.0, 4050.0),
        ],
        anchors=[(0, 0, -350), (30, 14, 80), (120, 4, 280), (180, 0, 580), (-40, 0, 450), (-110, 2, 180), (-40, 0, -200)],
    ),
    "mexico": CircuitDefinition(
        circuit_id="mexico",
        official_name="Autódromo Hermanos Rodríguez",
        country="Mexico",
        location="Mexico City",
        length_meters=4304.0,
        turn_count=17,
        drs_zone_count=3,
        lap_record_time="1:17.774",
        lap_record_driver="Valtteri Bottas",
        lap_record_year=2021,
        recent_fastest_lap="1:20.045",
        recent_driver="Charles Leclerc",
        recent_year=2024,
        turns=[
            TurnInfo(1, "T1 Chicane", 110.0, 3, 850.0),
            TurnInfo(4, "T4 Chicane", 120.0, 3, 1450.0),
            TurnInfo(7, "Esses Entry", 215.0, 5, 2200.0),
            TurnInfo(12, "Foro Sol Baseball Stadium", 72.0, 2, 3600.0),
            TurnInfo(17, "Mansell Curve", 195.0, 5, 4150.0),
        ],
        drs_zones=[
            DrsZone(1, "Main Straight (1.3km)", 150.0, 1100.0),
            DrsZone(2, "Turns 3-4 Straight", 1250.0, 1650.0),
            DrsZone(3, "Back Straight", 2950.0, 3500.0),
        ],
        anchors=[(0, 0, -350), (30, 0, 220), (90, 0, 380), (140, 0, 520), (-60, 0, 320), (-40, 0, -180)],
    ),
    "interlagos": CircuitDefinition(
        circuit_id="interlagos",
        official_name="Autódromo José Carlos Pace (Interlagos)",
        country="Brazil",
        location="São Paulo",
        length_meters=4309.0,
        turn_count=15,
        drs_zone_count=2,
        lap_record_time="1:10.540",
        lap_record_driver="Valtteri Bottas",
        lap_record_year=2018,
        recent_fastest_lap="1:20.472",
        recent_driver="Max Verstappen (Wet)",
        recent_year=2024,
        turns=[
            TurnInfo(1, "Senna S", 110.0, 3, 380.0),
            TurnInfo(4, "Descida do Lago", 145.0, 3, 1250.0),
            TurnInfo(8, "Ferradura", 195.0, 5, 2050.0),
            TurnInfo(10, "Bico de Pato Hairpin", 75.0, 2, 2600.0),
            TurnInfo(12, "Junção", 130.0, 3, 3200.0),
            TurnInfo(14, "Subida dos Boxes", 265.0, 7, 3950.0),
        ],
        drs_zones=[
            DrsZone(1, "Main Pit Straight", 120.0, 650.0),
            DrsZone(2, "Reta Oposta", 650.0, 1350.0),
        ],
        anchors=[(0, 0, -280), (-50, -8, 80), (-110, -12, 280), (20, -4, 390), (90, 0, 240), (60, 8, 80), (20, 16, -150)],
    ),
    "lasvegas": CircuitDefinition(
        circuit_id="lasvegas",
        official_name="Las Vegas Strip Circuit",
        country="United States",
        location="Las Vegas, Nevada",
        length_meters=6201.0,
        turn_count=17,
        drs_zone_count=2,
        lap_record_time="1:35.490",
        lap_record_driver="Oscar Piastri",
        lap_record_year=2023,
        recent_fastest_lap="1:35.782",
        recent_driver="Lando Norris",
        recent_year=2024,
        turns=[
            TurnInfo(1, "Koval Hairpin", 90.0, 2, 450.0),
            TurnInfo(5, "Sphere Sweeper", 130.0, 3, 1750.0),
            TurnInfo(12, "The Strip Straight Entry", 165.0, 4, 3100.0),
            TurnInfo(14, "Harmon Avenue Chicane", 105.0, 3, 5100.0),
        ],
        drs_zones=[
            DrsZone(1, "The Strip (1.9km Straight)", 3250.0, 5050.0),
            DrsZone(2, "Koval Straight to Sphere", 650.0, 1550.0),
        ],
        anchors=[(0, 0, -380), (40, 0, 120), (110, 0, 380), (30, 0, 650), (-90, 0, 120), (-30, 0, -250)],
    ),
    "lusail": CircuitDefinition(
        circuit_id="lusail",
        official_name="Lusail International Circuit",
        country="Qatar",
        location="Lusail, Doha",
        length_meters=5419.0,
        turn_count=16,
        drs_zone_count=1,
        lap_record_time="1:24.319",
        lap_record_driver="Max Verstappen",
        lap_record_year=2023,
        recent_fastest_lap="1:23.670",
        recent_driver="Lando Norris",
        recent_year=2024,
        turns=[
            TurnInfo(1, "Turn 1 Right Hairpin", 110.0, 3, 1150.0),
            TurnInfo(6, "Turn 6 Tight Left", 105.0, 2, 2350.0),
            TurnInfo(12, "Triple Apex Sweeper", 245.0, 6, 4100.0),
            TurnInfo(16, "Turn 16 onto 1.07km Straight", 145.0, 3, 5100.0),
        ],
        drs_zones=[DrsZone(1, "Main Pit Straight (1.07km)", 120.0, 1050.0)],
        anchors=[(0, 0, -360), (50, 0, 220), (120, 0, 420), (20, 0, 580), (-70, 0, 250), (-20, 0, -200)],
    ),
    "yasmarina": CircuitDefinition(
        circuit_id="yasmarina",
        official_name="Yas Marina Circuit",
        country="United Arab Emirates",
        location="Abu Dhabi",
        length_meters=5281.0,
        turn_count=16,
        drs_zone_count=2,
        lap_record_time="1:26.103",
        lap_record_driver="Max Verstappen",
        lap_record_year=2021,
        recent_fastest_lap="1:27.234",
        recent_driver="Kevin Magnussen",
        recent_year=2024,
        turns=[
            TurnInfo(1, "Turn 1 Left", 135.0, 3, 450.0),
            TurnInfo(5, "North Hairpin", 85.0, 2, 1450.0),
            TurnInfo(9, "Marsa Banked Sweeper", 235.0, 6, 3150.0),
            TurnInfo(12, "Hotel Complex", 110.0, 3, 4200.0),
        ],
        drs_zones=[
            DrsZone(1, "Long Back Straight (1.2km)", 1600.0, 2750.0),
            DrsZone(2, "Secondary Straight", 2850.0, 3350.0),
        ],
        anchors=[(0, 0, -320), (45, 0, 120), (120, 0, 320), (40, 0, 580), (-60, 0, 310), (-30, 0, -180)],
    ),
}

def generate_circuit_spline(circuit_id: str, point_count: int = 500) -> List[TrackWaypoint]:
    """Generates deterministic Catmull-Rom closed spline waypoints with speeds and gears."""
    defn = CIRCUITS.get(circuit_id, CIRCUITS["singapore"])
    anchors = defn.anchors
    n = len(anchors)
    if n < 3:
        raise ValueError("Circuit requires at least 3 control points")

    raw_points: List[Tuple[float, float, float]] = []
    steps_per_segment = max(1, point_count // n)

    for i in range(n):
        p0 = anchors[(i - 1 + n) % n]
        p1 = anchors[i]
        p2 = anchors[(i + 1) % n]
        p3 = anchors[(i + 2) % n]

        for s in range(steps_per_segment):
            t = s / steps_per_segment
            t2 = t * t
            t3 = t2 * t

            # Catmull-Rom spline formula
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            z = 0.5 * ((2 * p1[2]) + (-p0[2] + p2[2]) * t + (2 * p0[2] - 5 * p1[2] + 4 * p2[2] - p3[2]) * t2 + (-p0[2] + 3 * p1[2] - 3 * p2[2] + p3[2]) * t3)
            raw_points.append((x, y, z))

    # Calculate distances and heading
    total_len = 0.0
    distances = [0.0]
    for i in range(1, len(raw_points)):
        dx = raw_points[i][0] - raw_points[i - 1][0]
        dy = raw_points[i][1] - raw_points[i - 1][1]
        dz = raw_points[i][2] - raw_points[i - 1][2]
        dist = math.sqrt(dx * dx + dy * dy + dz * dz)
        total_len += dist
        distances.append(total_len)

    scale = defn.length_meters / total_len if total_len > 0 else 1.0
    waypoints: List[TrackWaypoint] = []
    num_pts = len(raw_points)

    for i in range(num_pts):
        pt = raw_points[i]
        next_pt = raw_points[(i + 1) % num_pts]
        prev_pt = raw_points[(i - 1 + num_pts) % num_pts]

        dx = next_pt[0] - pt[0]
        dz = next_pt[2] - pt[2]
        heading = math.atan2(dx, dz)

        dx1, dz1 = pt[0] - prev_pt[0], pt[2] - prev_pt[2]
        dx2, dz2 = next_pt[0] - pt[0], next_pt[2] - pt[2]
        angle1 = math.atan2(dx1, dz1)
        angle2 = math.atan2(dx2, dz2)
        diff = angle2 - angle1
        while diff > math.pi: diff -= 2 * math.pi
        while diff < -math.pi: diff += 2 * math.pi
        curvature = abs(diff)

        # Dynamic corner speed limit
        speed_kph = max(70.0, min(335.0, 335.0 - curvature * 380.0))
        if speed_kph < 95.0: gear = 2
        elif speed_kph < 140.0: gear = 3
        elif speed_kph < 190.0: gear = 4
        elif speed_kph < 240.0: gear = 5
        elif speed_kph < 280.0: gear = 6
        elif speed_kph < 315.0: gear = 7
        else: gear = 8

        waypoints.append(TrackWaypoint(
            x=pt[0],
            y=pt[1],
            z=pt[2],
            distance_meters=distances[i] * scale,
            curvature=curvature,
            heading=heading,
            speed_limit_kph=round(speed_kph, 1),
            recommended_gear=gear,
        ))

    return waypoints
