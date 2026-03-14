// AllTracks Mobile - Home Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';

import { apiService } from '../services/api';
import { type Track, type SportType } from '../types';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [sportTypes, setSportTypes] = useState<SportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tracksData, sportsData] = await Promise.all([
        apiService.getTracks({ active: true }),
        apiService.getSportTypes(),
      ]);
      setTracks(tracksData);
      setSportTypes(sportsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTracks = selectedSport
    ? tracks.filter(track => track.sportTypeId === selectedSport)
    : tracks;

  const renderTrackItem = ({ item }: { item: Track }) => (
    <TouchableOpacity
      style={styles.trackCard}
      onPress={() => navigation.navigate('TrackDetail', { trackId: item.id })}
    >
      <View style={styles.trackHeader}>
        <Text style={styles.trackName}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>⭐ {item.rating.toFixed(1)}</Text>
        </View>
      </View>
      
      <Text style={styles.trackCity}>📍 {item.city}</Text>
      
      {item.description && (
        <Text style={styles.trackDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      
      <View style={styles.trackDetails}>
        <Text style={styles.detailText}>📏 {item.length} м</Text>
        <Text style={styles.detailText}>🎯 Сложность: {item.complexity}/5</Text>
      </View>
      
      {item.images && item.images.length > 0 && (
        <Image
          source={{ uri: item.images[0].url }}
          style={styles.trackImage}
          resizeMode="cover"
        />
      )}
    </TouchableOpacity>
  );

  const renderSportFilter = ({ item }: { item: SportType }) => (
    <TouchableOpacity
      style={[
        styles.sportFilter,
        selectedSport === item.id && styles.sportFilterActive,
      ]}
      onPress={() => setSelectedSport(selectedSport === item.id ? null : item.id)}
    >
      <Text
        style={[
          styles.sportFilterText,
          selectedSport === item.id && styles.sportFilterTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Загрузка треков...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Фильтры по видам спорта */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={sportTypes}
          renderItem={renderSportFilter}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Список треков */}
      <FlatList
        data={filteredTracks}
        renderItem={renderTrackItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.tracksList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {selectedSport ? 'Нет треков для выбранного вида спорта' : 'Треки не найдены'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filtersList: {
    paddingHorizontal: 10,
  },
  sportFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  sportFilterActive: {
    backgroundColor: '#007AFF',
  },
  sportFilterText: {
    fontSize: 14,
    color: '#333',
  },
  sportFilterTextActive: {
    color: '#fff',
  },
  tracksList: {
    padding: 10,
  },
  trackCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  ratingContainer: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  trackCity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  trackDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  trackDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  trackImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
