// AllTracks Mobile - Track Detail Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { apiService } from '../services/api';
import { type Track, type SportType } from '../types';

interface TrackDetailScreenProps {
  route: any;
  navigation: any;
}

export default function TrackDetailScreen({ route, navigation }: TrackDetailScreenProps) {
  const { trackId } = route.params;
  const [track, setTrack] = useState<Track | null>(null);
  const [sportType, setSportType] = useState<SportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const loadTrack = async () => {
    try {
      setLoading(true);
      const trackData = await apiService.getTrackById(trackId);
      setTrack(trackData);
      
      if (trackData.sportTypeId) {
        const sportData = await apiService.getSportTypeById(trackData.sportTypeId);
        setSportType(sportData);
      }
    } catch (error) {
      console.error('Error loading track:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить информацию о треке');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrack();
  }, [trackId]);

  const openMap = () => {
    if (track?.coordinates) {
      const { lat, lng } = track.coordinates;
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      Linking.openURL(url);
    }
  };

  const callPhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (!track) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Трек не найден</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Галерея изображений */}
      {track.images && track.images.length > 0 && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: track.images[currentImageIndex].url }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          {track.images.length > 1 && (
            <View style={styles.imagePagination}>
              {track.images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentImageIndex && styles.paginationDotActive,
                  ]}
                  onPress={() => setCurrentImageIndex(index)}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Основная информация */}
      <View style={styles.content}>
        <Text style={styles.title}>{track.name}</Text>
        
        {sportType && (
          <View style={styles.sportBadge}>
            <Text style={styles.sportBadgeText}>{sportType.name}</Text>
          </View>
        )}

        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>⭐ {track.rating.toFixed(1)}</Text>
          <Text style={styles.complexityText}>Сложность: {track.complexity}/5</Text>
        </View>

        {/* Местоположение */}
        <TouchableOpacity style={styles.locationContainer} onPress={openMap}>
          <Text style={styles.locationIcon}>📍</Text>
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationCity}>{track.city}</Text>
            {track.coordinates && (
              <Text style={styles.locationCoords}>
                {track.coordinates.lat.toFixed(4)}, {track.coordinates.lng.toFixed(4)}
              </Text>
            )}
          </View>
          <Text style={styles.mapLink}>Открыть на карте →</Text>
        </TouchableOpacity>

        {/* Карта */}
        {track.coordinates && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: track.coordinates.lat,
                longitude: track.coordinates.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: track.coordinates.lat,
                  longitude: track.coordinates.lng,
                }}
                title={track.name}
                description={track.city}
              />
            </MapView>
          </View>
        )}

        {/* Описание */}
        {track.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Описание</Text>
            <Text style={styles.description}>{track.description}</Text>
          </View>
        )}

        {/* Детали */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Информация</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📏 Длина:</Text>
            <Text style={styles.detailValue}>{track.length} м</Text>
          </View>
          
          {track.workingHours && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🕒 Часы работы:</Text>
              <Text style={styles.detailValue}>{track.workingHours}</Text>
            </View>
          )}
          
          {track.seasonOfWork && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📅 Сезон:</Text>
              <Text style={styles.detailValue}>{track.seasonOfWork}</Text>
            </View>
          )}
          
          {track.coverage && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🛣️ Покрытие:</Text>
              <Text style={styles.detailValue}>{track.coverage}</Text>
            </View>
          )}
        </View>

        {/* Даты */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Даты</Text>
          <Text style={styles.dateText}>
            Создано: {new Date(track.createdAt).toLocaleDateString('ru-RU')}
          </Text>
          <Text style={styles.dateText}>
            Обновлено: {new Date(track.updatedAt).toLocaleDateString('ru-RU')}
          </Text>
        </View>
      </View>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: 250,
  },
  imagePagination: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sportBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  sportBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  complexityText: {
    fontSize: 16,
    color: '#666',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationCity: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  locationCoords: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  mapLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
