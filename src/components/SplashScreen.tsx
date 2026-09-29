import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface SplashScreenProps {
  onFinish?: () => void;
  autoHideDuration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  autoHideDuration = 2500,
}) => {
  const [fadingOut, setFadingOut] = useState<boolean>(false);

  useEffect(() => {
    if (autoHideDuration <= 0) return;

    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, autoHideDuration - 400);

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, autoHideDuration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [autoHideDuration, onFinish]);

  if (fadingOut) return null;

  return (
    <View style={styles.container}>
      {/* Glow effect */}
      <View style={styles.glow} />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo Card */}
        <View style={styles.logoCard}>
          <View style={styles.logoInner}>
            <View style={styles.houseBox}>
              <View style={styles.coin}>
                <Text style={styles.coinSymbol}>₫</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Brand Name */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>HomeFlow</Text>
            <Text style={styles.dotText}>.</Text>
          </View>
          <Text style={styles.subtitleText}>
            Tổ ấm thảnh thơi <Text style={styles.bullet}>•</Text> Tài chính vẹn tròn
          </Text>
        </View>
      </View>

      {/* Loading Indicator */}
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#34D399" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    backgroundColor: '#02331b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  content: {
    alignItems: 'center',
    gap: 24,
  },
  logoCard: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: '#056839',
    padding: 3,
    shadowColor: '#056839',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  logoInner: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: 'rgba(5, 104, 57, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  houseBox: {
    width: 48,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  coinSymbol: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  textContainer: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  titleText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  dotText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#F97316',
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A7F3D0',
    marginTop: 6,
  },
  bullet: {
    color: '#34D399',
    marginHorizontal: 4,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 48,
  },
});
