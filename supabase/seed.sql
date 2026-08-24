-- Seed Script for Multiverse Tracker
-- Curated MCU & DCU Media Entries

insert into public.franchise_media (id, universe, title, media_type, release_order, chronological_order, phase_or_chapter, trakt_id, tmdb_id, poster_path, is_released, release_date, overview) values
-- MCU Phase 1
('a0000001-0000-0000-0000-000000000001', 'mcu', 'Iron Man', 'movie', 1, 3, 'Phase 1', 22, 1726, 'https://image.tmdb.org/t/p/w500/78lPtwv72eTNqFW9COBYI0dWDJa.jpg', true, '2008-05-02', 'After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor to fight evil.'),
('a0000001-0000-0000-0000-000000000002', 'mcu', 'The Incredible Hulk', 'movie', 2, 5, 'Phase 1', 1144, 1724, 'https://image.tmdb.org/t/p/w500/gKzYx79y0AQTL4UAi70SlJfaNkj.jpg', true, '2008-06-13', 'Scientist Bruce Banner scours the planet for an antidote to the unbridled force of rage within him: the Hulk.'),
('a0000001-0000-0000-0000-000000000003', 'mcu', 'Iron Man 2', 'movie', 3, 4, 'Phase 1', 1145, 10138, 'https://image.tmdb.org/t/p/w500/6WBeq4jjNpCwMiugOOyfTBwqvLM.jpg', true, '2010-05-07', 'Tony Stark contends with declining health and a vengeful mad man.'),
('a0000001-0000-0000-0000-000000000004', 'mcu', 'Thor', 'movie', 4, 6, 'Phase 1', 28833, 10195, 'https://image.tmdb.org/t/p/w500/prSfAi1xGrhLQNxVSUFh61xQ4Qx.jpg', true, '2011-05-06', 'Thor is cast out of Asgard to live amongst humans in Midgard.'),
('a0000001-0000-0000-0000-000000000005', 'mcu', 'Captain America: The First Avenger', 'movie', 5, 1, 'Phase 1', 28834, 1771, 'https://image.tmdb.org/t/p/w500/vSNxAJTlD0r02V9sPYpqjqDIP9G.jpg', true, '2011-07-22', 'Steve Rogers transforms into Captain America during World War II.'),
('a0000001-0000-0000-0000-000000000006', 'mcu', 'The Avengers', 'movie', 6, 7, 'Phase 1', 16644, 24428, 'https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg', true, '2012-05-04', 'Earth''s mightiest heroes assemble to defeat Loki.'),

-- MCU Phase 2 & 3 Highlights
('a0000001-0000-0000-0000-000000000007', 'mcu', 'Iron Man 3', 'movie', 7, 8, 'Phase 2', 61961, 68721, 'https://image.tmdb.org/t/p/w500/qhPtAc1TKbMPqNvcdXS46um79T.jpg', true, '2013-05-03', 'Tony Stark faces the Mandarin.'),
('a0000001-0000-0000-0000-000000000008', 'mcu', 'Captain America: The Winter Soldier', 'movie', 9, 10, 'Phase 2', 79134, 100402, 'https://image.tmdb.org/t/p/w500/tVFRpFw3xTed5YGqxW0AOmi40Kg.jpg', true, '2014-04-04', 'Steve Rogers faces the Winter Soldier.'),
('a0000001-0000-0000-0000-000000000009', 'mcu', 'Guardians of the Galaxy', 'movie', 10, 11, 'Phase 2', 79135, 118340, 'https://image.tmdb.org/t/p/w500/r7vmZjiyZw9rpJMQJdXpjgiCOk9.jpg', true, '2014-08-01', 'A group of intergalactic criminals pull together to save the galaxy.'),
('a0000001-0000-0000-0000-000000000010', 'mcu', 'Avengers: Infinity War', 'movie', 19, 22, 'Phase 3', 181316, 299536, 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg', true, '2018-04-27', 'The Avengers battle Thanos for the Infinity Stones.'),
('a0000001-0000-0000-0000-000000000011', 'mcu', 'Avengers: Endgame', 'movie', 22, 23, 'Phase 3', 181317, 299534, 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg', true, '2019-04-26', 'The Avengers assemble once more to reverse the snap.'),

-- DCU Highlights
('b0000001-0000-0000-0000-000000000001', 'dcu', 'Man of Steel', 'movie', 1, 3, 'DCEU Era', 49526, 49521, 'https://image.tmdb.org/t/p/w500/7rIPjn5aeHG746byG00W0Qz7bC4.jpg', true, '2013-06-14', 'Clark Kent discovers his true heritage.'),
('b0000001-0000-0000-0000-000000000002', 'dcu', 'Batman v Superman: Dawn of Justice', 'movie', 2, 4, 'DCEU Era', 115934, 209112, 'https://image.tmdb.org/t/p/w500/5UsK3grJvtQ7zCuEjN0xFiNa9Z9.jpg', true, '2016-03-25', 'Gotham''s vigilante faces Metropolis'' savior.'),
('b0000001-0000-0000-0000-000000000003', 'dcu', 'Wonder Woman', 'movie', 4, 1, 'DCEU Era', 181318, 297762, 'https://image.tmdb.org/t/p/w500/imekS7f1OuHyUP2LAiTEM0zBzUz.jpg', true, '2017-06-02', 'Diana of Themyscira enters World War I.'),
('b0000001-0000-0000-0000-000000000004', 'dcu', 'Zack Snyder''s Justice League', 'movie', 5, 6, 'DCEU Era', 488058, 791373, 'https://image.tmdb.org/t/p/w500/tnAuB8q5vv7Ax9UAEje5Xi4b029.jpg', true, '2021-03-18', 'The Justice League defends Earth from Steppenwolf and Darkseid.'),
('b0000001-0000-0000-0000-000000000005', 'dcu', 'Creature Commandos', 'show', 17, 17, 'Chapter 1: Gods & Monsters', 201104, 219109, 'https://image.tmdb.org/t/p/w500/961g66k5j1Z5A854hB846f41Q7a.jpg', true, '2024-12-05', 'Amanda Waller recruits monster prisoners.'),
('b0000001-0000-0000-0000-000000000006', 'dcu', 'Superman', 'movie', 18, 18, 'Chapter 1: Gods & Monsters', 673424, 1061181, 'https://image.tmdb.org/t/p/w500/superman_2025_poster.jpg', false, '2025-07-11', 'James Gunn''s Superman film relaunching the DCU.'),
('b0000001-0000-0000-0000-000000000007', 'dcu', 'The Batman', 'movie', 24, 24, 'Elseworlds', 343888, 414906, 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg', true, '2022-03-04', 'Batman hunts the Riddler in Gotham City.')
on conflict (id) do nothing;
